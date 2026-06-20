import asyncio
import json
import logging
from google.genai import types
import config
import tools  # noqa: F401 — registers all tool handlers
from gemini.live_config import build_config
from state import SessionState
from tools.registry import get_handler
from documents.finalize import finalize
from documents.deliver import deliver
from tools.emergency import run_emergency

logger = logging.getLogger(__name__)


class LiveSession:
    def __init__(self, websocket, state: SessionState):
        self.ws = websocket
        self.state = state
        self._tasks: list[asyncio.Task] = []
        self._ws_lock = asyncio.Lock()
        self._gemini_lock = asyncio.Lock()

    async def run(self):
        async with config.gemini_client.aio.live.connect(
            model=config.MODEL_ID,
            config=build_config(),
        ) as gemini_session:
            # Prompt the model to open with a greeting.
            await gemini_session.send_client_content(
                turns={
                    "parts": [{"text": "Please begin the patient intake interview."}]
                },
                turn_complete=True,
            )

            uplink = asyncio.create_task(self._uplink(gemini_session))
            downlink = asyncio.create_task(self._downlink(gemini_session))
            self._tasks = [uplink, downlink]

            # Run until one side ends, then tear down the other.
            try:
                await asyncio.wait(
                    [uplink, downlink],
                    return_when=asyncio.FIRST_COMPLETED,
                )
            finally:
                for task in self._tasks:
                    if not task.done():
                        task.cancel()
                        try:
                            await task
                        except (asyncio.CancelledError, Exception):
                            pass

    async def cleanup(self):
        for task in self._tasks:
            if not task.done():
                task.cancel()

    # ------------------------------------------------------------------
    # Browser helpers
    # ------------------------------------------------------------------

    async def _send_to_browser(self, msg: bytes | dict) -> None:
        try:
            async with self._ws_lock:
                if isinstance(msg, bytes):
                    await self.ws.send_bytes(msg)
                else:
                    await self.ws.send_json(msg)
        except Exception:
            pass  # WS already closed

    # ------------------------------------------------------------------
    # Uplink: browser → Gemini
    # ------------------------------------------------------------------

    async def _uplink(self, gemini_session) -> None:
        while True:
            try:
                data = await self.ws.receive()
            except Exception:
                break

            msg_type = data.get("type")
            if msg_type == "websocket.disconnect":
                break

            raw_bytes = data.get("bytes")
            raw_text = data.get("text")

            if raw_bytes:
                async with self._gemini_lock:
                    await gemini_session.send_realtime_input(
                        media=types.Blob(
                            data=raw_bytes,
                            mime_type="audio/pcm;rate=16000",
                        )
                    )
            elif raw_text:
                try:
                    control = json.loads(raw_text)
                except json.JSONDecodeError:
                    continue
                if control.get("type") == "config":
                    email = control.get("doctorEmail")
                    if email:
                        self.state.recipient_email = email
                elif control.get("type") == "end_session":
                    await self._run_manual_finish()
                    break
                elif control.get("type") == "emergency":
                    reason = control.get(
                        "reason", "Emergency flagged manually during consultation."
                    )
                    severity = control.get("severity", "critical")
                    await run_emergency(
                        reason, severity, self.state, self._send_to_browser
                    )
                    break

    # ------------------------------------------------------------------
    # Downlink: Gemini → browser
    # ------------------------------------------------------------------

    async def _downlink(self, gemini_session) -> None:
        try:
            while True:
                async for msg in gemini_session.receive():
                    await self._dispatch(msg, gemini_session)
                    # finish_interview sets this once its response is sent.
                    if self.state.finished:
                        return
        except asyncio.CancelledError:
            raise
        except Exception as e:
            logger.error("downlink error: %s", e)
            await self._send_to_browser({"type": "error", "message": str(e)})

    async def _dispatch(self, msg, gemini_session) -> None:
        # Audio bytes
        if msg.data:
            await self._send_to_browser(msg.data)

        if not msg.server_content:
            if msg.tool_call:
                await self._handle_tool_calls(
                    msg.tool_call.function_calls, gemini_session
                )
            return

        sc = msg.server_content

        if sc.interrupted:
            await self._send_to_browser({"type": "interrupt"})

        if sc.input_transcription and sc.input_transcription.text:
            text = sc.input_transcription.text
            self.state.transcript.append({"role": "user", "text": text})
            await self._send_to_browser(
                {"type": "transcript", "role": "user", "text": text}
            )

        if sc.output_transcription and sc.output_transcription.text:
            text = sc.output_transcription.text
            self.state.transcript.append({"role": "model", "text": text})
            await self._send_to_browser(
                {"type": "transcript", "role": "model", "text": text}
            )

        if sc.turn_complete:
            await self._send_to_browser({"type": "turn_complete"})

    # ------------------------------------------------------------------
    # Tool dispatch
    # ------------------------------------------------------------------

    async def _handle_tool_calls(self, function_calls, gemini_session) -> None:
        responses: list[types.FunctionResponse] = []

        for fc in function_calls:
            await self._send_to_browser(
                {"type": "tool_call", "name": fc.name, "args": fc.args or {}}
            )

            handler = get_handler(fc.name)
            if handler is None:
                logger.warning("unknown tool: %s", fc.name)
                responses.append(
                    types.FunctionResponse(
                        id=fc.id,
                        name=fc.name,
                        response={"error": "unknown tool"},
                    )
                )
                continue

            response = await handler(fc, self.state, self._send_to_browser)
            responses.append(response)

        async with self._gemini_lock:
            await gemini_session.send_tool_response(function_responses=responses)

    # ------------------------------------------------------------------
    # Manual finish (triggered by end_session control message)
    # ------------------------------------------------------------------

    async def _run_manual_finish(self) -> None:
        try:
            record = await finalize(self.state.transcript, self.state.notes)
            self.state.record = record.model_dump()
            # Deliver before announcing completion — the browser navigates away
            # on session_complete, closing the WS, which would otherwise cancel
            # this mid-send.
            await deliver(
                record, self.state.recipient_email, notify=self._send_to_browser
            )
            await self._send_to_browser(
                {"type": "session_complete", "record": self.state.record}
            )
        except Exception as e:
            logger.error("manual finish failed: %s", e)
            await self._send_to_browser(
                {"type": "error", "message": f"Could not finalize record: {e}"}
            )
