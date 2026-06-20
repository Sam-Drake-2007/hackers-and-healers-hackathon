import asyncio


class SessionState:
    def __init__(self):
        self.transcript: list[dict] = []
        self.notes: str = ""
        self.record: dict | None = None
        # Recipient for the patient record email, set by the browser's "config"
        # message. Falls back to config.DOCTOR_EMAIL when unset.
        self.recipient_email: str | None = None
        # Set by finish_interview to signal the session should end.
        self.finished: bool = False
        # Emergency pause/resume coordination. The blocking emergency_alert tool
        # waits on resume_event; the browser releases it via a "resume" (false
        # alarm) or "escalate" (real emergency) control message.
        self.resume_event: asyncio.Event = asyncio.Event()
        self.emergency_resolution: str | None = None  # "resume" | "escalate"
        # True while a model emergency tool call is blocked awaiting resolution.
        self.emergency_active: bool = False
