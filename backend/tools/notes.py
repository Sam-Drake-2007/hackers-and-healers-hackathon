from google.genai import types
from state import SessionState
from tools.registry import register


@register("record_notes")
async def record_notes(
    fc: types.FunctionCall,
    state: SessionState,
    send_to_browser: callable,
) -> types.FunctionResponse:
    text = (fc.args or {}).get("text", "")
    state.notes = (state.notes + "\n" + text).strip() if state.notes else text

    await send_to_browser({"type": "notes", "text": state.notes})

    return types.FunctionResponse(
        id=fc.id,
        name=fc.name,
        response={"result": "noted"},
        scheduling=types.FunctionResponseScheduling.SILENT,
    )
