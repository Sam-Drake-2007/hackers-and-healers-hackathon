import logging
from google.genai import types
from state import SessionState
from tools.registry import register
from documents.finalize import finalize
from documents.deliver import deliver

logger = logging.getLogger(__name__)


@register("emergency_alert")
async def emergency_alert(
    fc: types.FunctionCall,
    state: SessionState,
    send_to_browser: callable,
) -> types.FunctionResponse:
    args = fc.args or {}
    reason = args.get("reason", "")
    severity = args.get("severity", "urgent")

    # Alert the frontend immediately — before finalize, so the UI reacts
    # even if finalize is slow.
    await send_to_browser({
        "type": "emergency_alert",
        "severity": severity,
        "reason": reason,
    })

    try:
        record = await finalize(state.transcript, state.notes)
        state.record = record.model_dump()
        await send_to_browser({"type": "session_complete", "record": state.record})
        await deliver(record)
    except Exception as e:
        logger.error("emergency finalize failed: %s", e)
        await send_to_browser({"type": "error", "message": str(e)})

    # Tears down the session — model cannot speak after this point.
    state.finished = True

    return types.FunctionResponse(
        id=fc.id,
        name=fc.name,
        response={"result": "emergency_acknowledged"},
    )
