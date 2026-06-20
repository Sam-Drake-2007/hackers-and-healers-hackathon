import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

GEMINI_API_KEY: str = os.environ["GEMINI_API_KEY"]
MODEL_ID: str = os.environ.get("MODEL_ID", "gemini-2.5-flash-native-audio-latest")
FINALIZE_MODEL_ID: str = os.environ.get("FINALIZE_MODEL_ID", "gemini-2.0-flash")
DOCTOR_EMAIL: str = os.environ.get("DOCTOR_EMAIL", "")
RESEND_API_KEY: str = os.environ.get("RESEND_API_KEY", "")
FROM_EMAIL: str = os.environ.get("FROM_EMAIL", "")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
