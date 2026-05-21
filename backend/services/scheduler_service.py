from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timezone
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler(timezone="UTC")

    def start(self):
        self.scheduler.start()
        logger.info("Scheduler started")

    def stop(self):
        self.scheduler.shutdown()
        logger.info("Scheduler stopped")

    def add_one_time_job(self, job_id: str, func, run_at: datetime, kwargs: dict):
        self.scheduler.add_job(
            func,
            trigger=DateTrigger(run_date=run_at),
            id=job_id,
            kwargs=kwargs,
            replace_existing=True,
            misfire_grace_time=300,
        )
        logger.info(f"Scheduled one-time job {job_id} at {run_at}")

    def add_recurring_job(self, job_id: str, func, cron_expr: str, kwargs: dict):
        parts = cron_expr.strip().split()
        if len(parts) != 5:
            raise ValueError("Invalid cron expression (needs 5 parts: min hour day month weekday)")
        minute, hour, day, month, day_of_week = parts
        trigger = CronTrigger(
            minute=minute, hour=hour, day=day,
            month=month, day_of_week=day_of_week
        )
        self.scheduler.add_job(
            func,
            trigger=trigger,
            id=job_id,
            kwargs=kwargs,
            replace_existing=True,
            misfire_grace_time=300,
        )
        logger.info(f"Scheduled recurring job {job_id} with cron {cron_expr}")

    def remove_job(self, job_id: str):
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Removed job {job_id}")
        except Exception:
            pass

    def get_job(self, job_id: str):
        return self.scheduler.get_job(job_id)

    def list_jobs(self):
        return [{"id": j.id, "next_run": j.next_run_time} for j in self.scheduler.get_jobs()]

scheduler_service = SchedulerService()


async def execute_automation(automation_id: int):
    """Execute an automation by ID - called by scheduler"""
    from database import AsyncSessionLocal
    from models.automation import Automation
    from sqlalchemy import select
    from datetime import datetime, timezone
    import services.reddit_service as rs

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Automation).where(Automation.id == automation_id))
        automation = result.scalar_one_or_none()
        if not automation:
            logger.error(f"Automation {automation_id} not found")
            return

        try:
            result_data = None
            atype = automation.automation_type

            if atype == "scheduled_post":
                if automation.post_type == "link":
                    result_data = await rs.submit_link_post(
                        automation.subreddit, automation.post_title, automation.post_url
                    )
                else:
                    result_data = await rs.submit_text_post(
                        automation.subreddit, automation.post_title, automation.post_content or ""
                    )

            elif atype == "auto_reply":
                result_data = await rs.reply_to_post(
                    automation.reply_to_post_id, automation.reply_template or ""
                )

            elif atype == "keyword_reply":
                result_data = await rs.monitor_keyword_and_reply(
                    automation.subreddit,
                    automation.trigger_keyword or "",
                    automation.reply_template or "",
                )

            automation.last_run_at = datetime.now(timezone.utc)
            automation.run_count = (automation.run_count or 0) + 1
            if result_data and not result_data.get("success"):
                automation.last_error = result_data.get("error", "Unknown error")
                automation.status = "failed"
            else:
                automation.last_error = None
                if not automation.is_recurring:
                    automation.status = "completed"

            await db.commit()
        except Exception as e:
            logger.error(f"Error executing automation {automation_id}: {e}")
            automation.last_error = str(e)
            automation.status = "failed"
            await db.commit()
