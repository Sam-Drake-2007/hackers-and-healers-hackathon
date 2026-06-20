# Hackers & Healers Hackathon

> Gemini live integrating patient interview tool for family doctors. The tool is used to ask patients questions about their medical history, appointment reason, general questions, etc. It creates a document bsaed off that info and at the end emails it to the doctor. The doctor then can come in and see the patient as normal but saves a lot of time asking questions that the ai already answered (They look at the emailed document).

## Running the app

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on <http://localhost:5173>. Calls to `/api/...` are proxied to the backend — no CORS setup needed.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on <http://localhost:8000>. Health check: `GET /api/` → `{"status": "ok"}`.

**WSL — selecting the interpreter in your IDE:** use `backend/.venv/bin/python3` (not the system `python3`).
