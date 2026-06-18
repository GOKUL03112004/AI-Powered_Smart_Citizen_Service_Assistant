# AI-Powered Smart Citizen Service Assistant

A full-stack application that helps citizens navigate government services using AI.

## Tech Stack

**Frontend**: React (Vite) + TypeScript + Tailwind CSS + Axios  
**Backend**: FastAPI (Python 3.12) + uvicorn  
**AI**: Google Gemini 2.5 Flash + LangChain + LangGraph + CrewAI  
**Vector DB**: ChromaDB  

## Project Structure

```
├── frontend/          # React Vite app (src/)
├── backend/
│   ├── main.py        # FastAPI app entry point
│   ├── config.py      # Settings / env vars
│   ├── agents/        # CrewAI agents
│   │   ├── query_analyzer.py
│   │   ├── policy_research.py
│   │   └── review_agent.py
│   ├── workflows/     # LangGraph workflow
│   │   └── citizen_service_graph.py
│   ├── rag/           # RAG + ChromaDB
│   │   ├── vector_store.py
│   │   └── document_loader.py
│   ├── services/      # Business logic
│   │   ├── chat_service.py
│   │   ├── eligibility_service.py
│   │   └── simplifier_service.py
│   ├── api/           # FastAPI routes & schemas
│   │   ├── routes.py
│   │   └── schemas.py
│   └── data/          # Knowledge base documents
```

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your GOOGLE_API_KEY

python main.py
```

### Frontend

```bash
npm install
# Edit .env and set VITE_API_URL
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Chat with the AI assistant |
| POST | `/api/v1/eligibility` | Check scheme eligibility |
| POST | `/api/v1/simplify-policy` | Simplify government policy text |
| POST | `/api/v1/upload-document` | Upload document to knowledge base |
| GET | `/api/v1/health` | Health check |

## LangGraph Workflow

```
User Query
  → Query Analyzer (intent detection + entity extraction)
  → Policy Research (ChromaDB vector search)
  → Response Generation (Chain-of-Thought)
  → Review Agent (Self-Reflection improvement)
  → Final Response
```

## Deployment

**Frontend**: Deploy to [Vercel](https://vercel.com) - just push to GitHub and connect.  
Set `VITE_API_URL` env var to your Render backend URL.

**Backend**: Deploy to [Render](https://render.com) - use `render.yaml` configuration.  
Set `GOOGLE_API_KEY` and `CHROMA_DB_PATH` as environment variables.

## Environment Variables

### Backend (.env)
```
GOOGLE_API_KEY=your_google_api_key
CHROMA_DB_PATH=./chroma_db
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```
