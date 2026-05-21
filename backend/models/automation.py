from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class Automation(Base):
    __tablename__ = "automations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    automation_type = Column(String, nullable=False)  # "scheduled_post", "auto_reply", "scheduled_comment", "upvote_monitor"
    status = Column(String, default="active")  # active, paused, completed, failed

    # Common fields
    subreddit = Column(String, nullable=True)

    # Scheduling
    scheduled_at = Column(DateTime, nullable=True)  # one-time
    cron_expression = Column(String, nullable=True)  # recurring
    is_recurring = Column(Boolean, default=False)

    # Post fields
    post_title = Column(String, nullable=True)
    post_content = Column(Text, nullable=True)
    post_type = Column(String, default="text")  # text, link, image
    post_url = Column(String, nullable=True)

    # Reply/comment fields
    reply_template = Column(Text, nullable=True)
    trigger_keyword = Column(String, nullable=True)
    reply_to_post_id = Column(String, nullable=True)

    # Execution tracking
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    run_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)

    # Extra config
    config = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="automations")
