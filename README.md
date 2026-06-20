# Hackers & Healers Hackathon

> Project description goes here.

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
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Runs on <http://localhost:8000>. Health check: `GET /api/` → `{"status": "ok"}`.
