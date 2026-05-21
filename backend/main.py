from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from routers import auth, automations, reddit
from database import init_db
from services.scheduler_service import scheduler_service

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    scheduler_service.start()
    yield
    scheduler_service.stop()

app = FastAPI(
    title="Reddit Automator API",
    description="Schedule and automate Reddit posts and replies",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(automations.router, prefix="/api/automations", tags=["automations"])
app.include_router(reddit.router, prefix="/api/reddit", tags=["reddit"])

@app.get("/")
async def root():
    return {"message": "Reddit Automator API v2.0", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
