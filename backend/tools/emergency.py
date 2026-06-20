import logging
from google.genai import types
from state import SessionState
from tools.registry import register
from documents.finalize import finalize
from documents.deliver import deliver

logger = logging.getLogger(__name__)


async def escalate(state: SessionState, send_to_browser: callable) -> None:
    """Confirmed (real) emergency: finalize the record, email the doctor, and
    end the session. Shared by the model tool and the manual escalate control.
    """
    try:
        record = await finalize(state.transcript, state.notes)
        state.record = record.model_dump()
        # Deliver before announcing completion — the browser navigates away on
        # session_complete, which would otherwise cancel this mid-send.
        await deliver(record, state.recipient_email, notify=send_to_browser)
        await send_to_browser({"type": "session_complete", "record": state.record})
    except Exception as e:
        logger.error("emergency escalate failed: %s", e)
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

    # Surface the alert; the browser routes the patient to the emergency page.
    await send_to_browser(
        {"type": "emergency_alert", "severity": severity, "reason": reason}
    )

    # This is a BLOCKING tool: by not returning the function response yet, the
    # model is paused mid-interview. We wait for the user to resolve the alert.
    state.emergency_resolution = None
    state.resume_event.clear()
    state.emergency_active = True
    try:
        await state.resume_event.wait()
    finally:
        state.emergency_active = False

    if state.emergency_resolution == "escalate":
        await escalate(state, send_to_browser)
        return types.FunctionResponse(
            id=fc.id, name=fc.name, response={"result": "emergency_escalated"}
        )

    # False alarm — let the model pick the interview back up naturally.
    return types.FunctionResponse(
        id=fc.id,
        name=fc.name,
        response={
            "result": "false_alarm",
            "note": (
                "The patient indicated this was a false alarm. "
                "Resume the interview naturally where you left off."
            ),
        },
    )
