import logging
import config
from documents.record import PatientRecord
from documents.render import render_html
from documents.pdf import render_pdf
from documents.email import send_record_email

logger = logging.getLogger(__name__)


async def deliver(record: PatientRecord, recipient: str | None = None) -> None:
    """Render the patient record as a PDF and email it to the doctor.

    The recipient set by the browser takes precedence; if none was provided we
    fall back to config.DOCTOR_EMAIL.

    Failures are logged but not re-raised — the caller's session_complete
    message should still reach the frontend regardless.
    """
    recipient = recipient or config.DOCTOR_EMAIL

    if not recipient:
        logger.warning("No recipient email set — skipping delivery")
        return
    if not config.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set — skipping delivery")
        return
    if not config.FROM_EMAIL:
        logger.warning("FROM_EMAIL not set — skipping delivery")
        return

    try:
        html = render_html(record)
        pdf = await render_pdf(html)
        await send_record_email(pdf, recipient)
        logger.info("Patient record delivered to %s", recipient)
    except Exception:
        logger.exception("Failed to deliver patient record")
