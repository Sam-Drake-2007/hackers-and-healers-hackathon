import logging
from google.genai import types
from state import SessionState
from tools.registry import register
from documents.finalize import finalize
from documents.deliver import deliver

logger = logging.getLogger(__name__)


async def run_emergency(
    reason: str,
    severity: str,
    state: SessionState,
    send_to_browser: callable,
) -> None:
    """Core emergency escalation, shared by the model tool and the manual button.

    Surfaces the alert in the UI immediately, finalizes the record, emails it to
    the designated doctor, and tears down the session.
    """
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
        # Email the doctor set in Settings (falls back to config.DOCTOR_EMAIL).
        await deliver(record, state.recipient_email, notify=send_to_browser)
    except Exception as e:
        logger.error("emergency finalize failed: %s", e)
        await send_to_browser({"type": "error", "message": str(e)})

    # Tears down the session — model cannot speak after this point.
    state.finished = True


@register("emergency_alert")
async def emergency_alert(
    fc: types.FunctionCall,
    state: SessionState,
    send_to_browser: callable,
) -> types.FunctionResponse:
    args = fc.args or {}
    reason = args.get("reason", "")
    severity = args.get("severity", "urgent")

    await run_emergency(reason, severity, state, send_to_browser)

    return types.FunctionResponse(
        id=fc.id,
        name=fc.name,
        response={"result": "emergency_acknowledged"},
    )
