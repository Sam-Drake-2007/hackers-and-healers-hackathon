class SessionState:
    def __init__(self):
        self.transcript: list[dict] = []
        self.notes: str = ""
        self.record: dict | None = None
        # Set by finish_interview to signal the session should end.
        self.finished: bool = False
