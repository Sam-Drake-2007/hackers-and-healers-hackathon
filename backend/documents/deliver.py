import logging
import config
from documents.record import PatientRecord
from documents.render import render_html
from documents.pdf import render_pdf
from documents.email import send_record_email

logger = logging.getLogger(__name__)


async def deliver(record: PatientRecord) -> None:
    """Render the patient record as a PDF and email it to the doctor.

    Failures are logged but not re-raised — the caller's session_complete
    message should still reach the frontend regardless.
    """
    if not config.DOCTOR_EMAIL:
        logger.warning("DOCTOR_EMAIL not set — skipping delivery")
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
        await send_record_email(pdf)
        logger.info("Patient record delivered to %s", config.DOCTOR_EMAIL)
    except Exception:
        logger.exception("Failed to deliver patient record")
