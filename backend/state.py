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
