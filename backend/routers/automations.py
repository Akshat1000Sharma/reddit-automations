from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
from models.automation import Automation
from models.user import User
from routers.auth import get_current_user
from services.scheduler_service import scheduler_service, execute_automation
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

AUTOMATION_TYPES = ["scheduled_post", "auto_reply", "keyword_reply", "scheduled_comment"]

class AutomationCreate(BaseModel):
    name: str
    automation_type: str
    subreddit: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    cron_expression: Optional[str] = None
    is_recurring: bool = False
    post_title: Optional[str] = None
    post_content: Optional[str] = None
    post_type: str = "text"
    post_url: Optional[str] = None
    reply_template: Optional[str] = None
    trigger_keyword: Optional[str] = None
    reply_to_post_id: Optional[str] = None
    config: Optional[dict] = None

class AutomationUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    subreddit: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    cron_expression: Optional[str] = None
    is_recurring: Optional[bool] = None
    post_title: Optional[str] = None
    post_content: Optional[str] = None
    post_type: Optional[str] = None
    post_url: Optional[str] = None
    reply_template: Optional[str] = None
    trigger_keyword: Optional[str] = None
    reply_to_post_id: Optional[str] = None

def automation_to_dict(a: Automation) -> dict:
    return {
        "id": a.id,
        "name": a.name,
        "automation_type": a.automation_type,
        "status": a.status,
        "subreddit": a.subreddit,
        "scheduled_at": a.scheduled_at.isoformat() if a.scheduled_at else None,
        "cron_expression": a.cron_expression,
        "is_recurring": a.is_recurring,
        "post_title": a.post_title,
        "post_content": a.post_content,
        "post_type": a.post_type,
        "post_url": a.post_url,
        "reply_template": a.reply_template,
        "trigger_keyword": a.trigger_keyword,
        "reply_to_post_id": a.reply_to_post_id,
        "last_run_at": a.last_run_at.isoformat() if a.last_run_at else None,
        "next_run_at": a.next_run_at.isoformat() if a.next_run_at else None,
        "run_count": a.run_count,
        "last_error": a.last_error,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "config": a.config,
    }

def schedule_automation(automation: Automation):
    job_id = f"automation_{automation.id}"
    if automation.status != "active":
        scheduler_service.remove_job(job_id)
        return

    if automation.is_recurring and automation.cron_expression:
        scheduler_service.add_recurring_job(
            job_id, execute_automation, automation.cron_expression,
            {"automation_id": automation.id}
        )
    elif automation.scheduled_at:
        from datetime import timezone
        run_at = automation.scheduled_at
        if run_at.tzinfo is None:
            run_at = run_at.replace(tzinfo=timezone.utc)
        scheduler_service.add_one_time_job(
            job_id, execute_automation, run_at,
            {"automation_id": automation.id}
        )

@router.get("/", response_model=List[dict])
async def list_automations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.user_id == current_user.id).order_by(Automation.created_at.desc())
    )
    automations = result.scalars().all()
    return [automation_to_dict(a) for a in automations]

@router.post("/", response_model=dict)
async def create_automation(
    data: AutomationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if data.automation_type not in AUTOMATION_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid automation type. Choose from: {AUTOMATION_TYPES}")

    automation = Automation(
        user_id=current_user.id,
        **data.model_dump()
    )
    db.add(automation)
    await db.commit()
    await db.refresh(automation)

    try:
        schedule_automation(automation)
    except Exception as e:
        logger.warning(f"Could not schedule automation {automation.id}: {e}")

    return automation_to_dict(automation)

@router.get("/{automation_id}", response_model=dict)
async def get_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.id == automation_id, Automation.user_id == current_user.id)
    )
    automation = result.scalar_one_or_none()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")
    return automation_to_dict(automation)

@router.put("/{automation_id}", response_model=dict)
async def update_automation(
    automation_id: int,
    data: AutomationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.id == automation_id, Automation.user_id == current_user.id)
    )
    automation = result.scalar_one_or_none()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(automation, field, value)

    await db.commit()
    await db.refresh(automation)

    try:
        schedule_automation(automation)
    except Exception as e:
        logger.warning(f"Could not reschedule automation {automation.id}: {e}")

    return automation_to_dict(automation)

@router.delete("/{automation_id}")
async def delete_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.id == automation_id, Automation.user_id == current_user.id)
    )
    automation = result.scalar_one_or_none()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    scheduler_service.remove_job(f"automation_{automation_id}")
    await db.delete(automation)
    await db.commit()
    return {"message": "Automation deleted"}

@router.post("/{automation_id}/run")
async def run_now(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.id == automation_id, Automation.user_id == current_user.id)
    )
    automation = result.scalar_one_or_none()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    await execute_automation(automation_id)
    await db.refresh(automation)
    return {"message": "Automation executed", "automation": automation_to_dict(automation)}

@router.post("/{automation_id}/pause")
async def pause_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.id == automation_id, Automation.user_id == current_user.id)
    )
    automation = result.scalar_one_or_none()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    automation.status = "paused"
    scheduler_service.remove_job(f"automation_{automation_id}")
    await db.commit()
    return {"message": "Automation paused"}

@router.post("/{automation_id}/resume")
async def resume_automation(
    automation_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Automation).where(Automation.id == automation_id, Automation.user_id == current_user.id)
    )
    automation = result.scalar_one_or_none()
    if not automation:
        raise HTTPException(status_code=404, detail="Automation not found")

    automation.status = "active"
    await db.commit()
    schedule_automation(automation)
    return {"message": "Automation resumed"}
