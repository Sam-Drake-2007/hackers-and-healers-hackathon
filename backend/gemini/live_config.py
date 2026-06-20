from google.genai import types

SYSTEM_PROMPT = """You are a compassionate medical intake assistant conducting a patient interview before their appointment.

Your role is to gather the patient's medical history naturally and conversationally. Cover these areas in a friendly, unhurried manner:
- Chief complaint: Why are they here today?
- History of present illness: When did it start, how has it progressed, what makes it better or worse?
- Past medical history: Previous conditions, surgeries, hospitalizations
- Current medications and dosages
- Allergies (especially drug allergies and reactions)
- Social history: Smoking, alcohol, occupation if relevant
- Brief review of systems relevant to their complaint

Guidelines:
- Ask one question at a time. Listen, then ask a follow-up or move to the next topic naturally.
- Use plain, friendly language — no medical jargon with the patient.
- As you learn important facts, call record_notes immediately in the background. You can keep talking while you do this.
- When you have covered all relevant areas and the patient has nothing more to add, call finish_interview to conclude.
- Do not announce that you are taking notes or calling any tools — just do it silently in the background.
- Start by warmly greeting the patient and asking what brings them in today."""

_RECORD_NOTES_DECL = types.FunctionDeclaration(
    name="record_notes",
    description=(
        "Record a clinical note about something the patient just shared — a symptom, diagnosis, "
        "medication, allergy, or relevant history. Call this whenever you learn a new fact. "
        "You can keep talking while this runs."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "text": types.Schema(
                type=types.Type.STRING,
                description="The clinical note to record. Be specific and clinically relevant.",
            ),
        },
        required=["text"],
    ),
    behavior=types.Behavior.NON_BLOCKING,
)

_FINISH_INTERVIEW_DECL = types.FunctionDeclaration(
    name="finish_interview",
    description=(
        "Call this when the intake interview is complete and all relevant information has been "
        "gathered. This finalizes the patient record and ends the session. Only call this once "
        "you are confident the intake is thorough."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={},
    ),
)

_EMERGENCY_ALERT_DECL = types.FunctionDeclaration(
    name="emergency_alert",
    description=(
        "Call this immediately if the patient describes symptoms of a medical emergency — "
        "chest pain, difficulty breathing, stroke symptoms, severe bleeding, loss of consciousness, "
        "suicidal ideation, or any other life-threatening situation. "
        "This alerts the care team instantly and pauses the interview while the situation is "
        "reviewed. Do not speak after calling this — wait for the tool to return. If it returns "
        "indicating a false alarm, resume the interview naturally."
    ),
    parameters=types.Schema(
        type=types.Type.OBJECT,
        properties={
            "reason": types.Schema(
                type=types.Type.STRING,
                description="Brief clinical reason for the alert (e.g. 'chest pain with left arm radiation').",
            ),
            "severity": types.Schema(
                type=types.Type.STRING,
                enum=["urgent", "critical"],
                description="urgent = needs immediate attention; critical = life-threatening.",
            ),
        },
        required=["reason", "severity"],
    ),
    # Default behavior is BLOCKING: model pauses during tool execution.
    # Combined with state.finished = True in the handler, the session is
    # torn down before Gemini can send any further audio.
)


def build_config() -> types.LiveConnectConfig:
    return types.LiveConnectConfig(
        response_modalities=["AUDIO"],
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        system_instruction=SYSTEM_PROMPT,
        tools=[
            types.Tool(
                function_declarations=[
                    _RECORD_NOTES_DECL,
                    _FINISH_INTERVIEW_DECL,
                    _EMERGENCY_ALERT_DECL,
                ]
            )
        ],
    )
