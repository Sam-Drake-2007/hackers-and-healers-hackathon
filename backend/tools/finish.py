import logging
from google.genai import types
from state import SessionState
from tools.registry import register
from documents.finalize import finalize
from documents.deliver import deliver

logger = logging.getLogger(__name__)


@register("finish_interview")
async def finish_interview(
    fc: types.FunctionCall,
    state: SessionState,
    send_to_browser: callable,
) -> types.FunctionResponse:
    try:
        record = await finalize(state.transcript, state.notes)
        state.record = record.model_dump()
        await send_to_browser({"type": "session_complete", "record": state.record})
        await deliver(record)
    except Exception as e:
        logger.error("finalize failed: %s", e)
        await send_to_browser({"type": "error", "message": f"Could not finalize record: {e}"})

    # Signal the session to tear down once this tool response is sent.
    state.finished = True

    return types.FunctionResponse(
        id=fc.id,
        name=fc.name,
        response={"result": "interview_complete"},
        scheduling=types.FunctionResponseScheduling.WHEN_IDLE,
    )
