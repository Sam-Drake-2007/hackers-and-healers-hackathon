class LiveSession:
    def __init__(self, websocket, state):
        self.ws = websocket
        self.state = state

    async def run(self):
        # TODO: open Gemini Live connection + start uplink/downlink tasks
        await self.ws.send_text('{"type":"error","message":"not implemented"}')

    async def cleanup(self):
        # TODO: cancel tasks, close Gemini session
        pass
