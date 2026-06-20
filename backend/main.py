from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from state import SessionState
from gemini.session import LiveSession

app = FastAPI()


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Server is running"}


@app.websocket("/ws")
async def interview_session(websocket: WebSocket):
    await websocket.accept()
    state = SessionState()
    session = LiveSession(websocket, state)
    try:
        await session.run()
    except WebSocketDisconnect:
        pass
    finally:
        await session.cleanup()
