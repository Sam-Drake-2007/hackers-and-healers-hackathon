import json
import logging
from google.genai import types
import config
from documents.record import PatientRecord

logger = logging.getLogger(__name__)

_PROMPT = """You are a clinical documentation specialist. Given the following patient interview transcript and live notes taken during the interview, produce a structured clinical intake summary.

TRANSCRIPT:
{transcript}

LIVE NOTES:
{notes}

Extract all clinically relevant information. For list fields (medications, allergies), return each item as a separate list entry. If information was not mentioned, leave the field as an empty string or empty list. Be accurate — do not infer or invent information not present in the transcript."""


async def finalize(transcript: list[dict], notes: str) -> PatientRecord:
    formatted = "\n".join(
        f"{entry['role'].upper()}: {entry['text']}" for entry in transcript
    )
    prompt = _PROMPT.format(transcript=formatted, notes=notes or "(none)")

    response = await config.gemini_client.aio.models.generate_content(
        model=config.FINALIZE_MODEL_ID,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=PatientRecord,
        ),
    )

    data = json.loads(response.text)
    return PatientRecord(**data)
