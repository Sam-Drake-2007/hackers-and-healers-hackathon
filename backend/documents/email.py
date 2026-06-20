import resend
import config


async def send_record_email(pdf: bytes, subject: str = "Patient Intake Record") -> None:
    """Email the PDF record to the doctor defined in config.DOCTOR_EMAIL."""
    resend.api_key = config.RESEND_API_KEY

    params: resend.Emails.SendParams = {
        "from": config.FROM_EMAIL,
        "to": [config.DOCTOR_EMAIL],
        "subject": subject,
        "html": (
            "<p>Please find the attached patient intake record generated from "
            "today's AI-assisted pre-consultation interview.</p>"
            "<p>This record was produced automatically.</p>"
        ),
        "attachments": [
            {
                "filename": "patient-intake-record.pdf",
                "content": list(pdf),
                "content_type": "application/pdf",
            }
        ],
    }

    await resend.Emails.send_async(params)
