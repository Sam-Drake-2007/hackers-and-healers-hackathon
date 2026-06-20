import resend
import config


async def send_record_email(
    pdf: bytes, recipient: str, subject: str = "Patient Intake Record"
) -> None:
    """Email the PDF record to the given recipient."""
    resend.api_key = config.RESEND_API_KEY

    params: resend.Emails.SendParams = {
        "from": config.FROM_EMAIL,
        "to": [recipient],
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


async def send_emergency_email(pdf: bytes, recipient: str) -> None:
    """Send an urgent emergency email to the recipient with the PDF attached."""
    resend.api_key = config.RESEND_API_KEY

    params: resend.Emails.SendParams = {
        "from": config.FROM_EMAIL,
        "to": [recipient],
        "subject": "EMERGENCY: Immediate attention required — patient alert",
        "html": (
            "<p><strong>EMERGENCY:</strong> The patient has confirmed an "
            "emergency that requires immediate attention. Please review the "
            "attached intake record and respond appropriately.</p>"
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
