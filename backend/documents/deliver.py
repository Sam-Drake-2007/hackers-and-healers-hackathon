import logging
from typing import Awaitable, Callable
import config
from documents.record import PatientRecord
from documents.render import render_html
from documents.pdf import render_pdf
from documents.email import send_record_email

logger = logging.getLogger(__name__)


async def deliver(
    record: PatientRecord,
    recipient: str | None = None,
    notify: Callable[[dict], Awaitable[None]] | None = None,
) -> None:
    """Render the patient record as a PDF and email it to the doctor.

    The recipient set by the browser takes precedence; if none was provided we
    fall back to config.DOCTOR_EMAIL.

    Failures are logged and, when ``notify`` is given, reported to the browser
    as an error message — but never re-raised, so the caller's session_complete
    message still reaches the frontend regardless.
    """

    async def fail(reason: str) -> None:
        logger.warning("Delivery skipped: %s", reason)
        if notify:
            await notify({"type": "error", "message": f"Email not sent: {reason}"})

    recipient = recipient or config.DOCTOR_EMAIL

    if not recipient:
        await fail("no recipient email set (set one in Settings)")
        return
    if not config.RESEND_API_KEY:
        await fail("RESEND_API_KEY not configured on the server")
        return
    if not config.FROM_EMAIL:
        await fail("FROM_EMAIL not configured on the server")
        return

    try:
        html = render_html(record)
        pdf = await render_pdf(html)
        await send_record_email(pdf, recipient)
        logger.info("Patient record delivered to %s", recipient)
    except Exception as e:
        logger.exception("Failed to deliver patient record")
        if notify:
            await notify(
                {"type": "error", "message": f"Email delivery failed: {e}"}
            )
