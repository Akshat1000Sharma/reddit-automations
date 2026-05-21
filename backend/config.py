from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Reddit
    REDDIT_CLIENT_ID: str = ""
    REDDIT_CLIENT_SECRET: str = ""
    REDDIT_USER_AGENT: str = "smma:social-media-marketing-agent:v2.0"
    REDDIT_OAUTH_SCOPES: str = "submit identity read"
    REDDIT_APP_TYPE: str = "web"
    REDDIT_ACCESS_TOKEN: str = ""
    REDDIT_DEFAULT_SUBREDDIT: str = "test"

    # App
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
