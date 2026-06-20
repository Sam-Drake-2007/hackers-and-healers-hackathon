class SessionState:
    def __init__(self):
        self.transcript: list[dict] = []
        self.notes: str = ""
        self.record: dict | None = None
