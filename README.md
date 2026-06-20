# EZ Check In

![ez-check-in](https://github.com/user-attachments/assets/ff59933f-a5ee-4d0d-887c-dcec12f1c931)

## The Idea

EZ Check In is a simple web app that allows patients to have a quick consultation with a virtual AI assistant while they wait for their doctors appointment. This allows clinic staff to focus on more important tasks, while the repetitive questions can be asked by the AI. During the consultation, the AI takes note of the important information that is shared and then emails the doctor with a pdf file of the notes, keeping patient information organized.

### Key Components

- Login page takes name and date of birth to assign patients to the correct appointment (not implemented).
- Consultation page allows the patient to speak with the AI, to take note of basic details that the doctor can expand on.
  - The page also includes an emergency feature, meaning if the AI finds that you are in immediate danger, or if you click the emergency button, clinic workers will be able to help you
- Transfer page lets you know when you have completeted the consultation and that the doctor is on the way.

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
