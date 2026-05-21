from fastapi import APIRouter, Depends, Query
from models.user import User
from routers.auth import get_current_user
from services.reddit_service import get_reddit_identity, get_subreddit_posts
from config import settings

router = APIRouter()

@router.get("/me")
async def reddit_me(current_user: User = Depends(get_current_user)):
    return await get_reddit_identity()

@router.get("/posts/{subreddit}")
async def subreddit_posts(
    subreddit: str,
    limit: int = Query(default=10, ge=1, le=50),
    sort: str = Query(default="hot"),
    current_user: User = Depends(get_current_user)
):
    posts = await get_subreddit_posts(subreddit, limit=limit, sort=sort)
    return {"subreddit": subreddit, "posts": posts}

@router.get("/default-subreddit")
async def default_subreddit(current_user: User = Depends(get_current_user)):
    return {"subreddit": settings.REDDIT_DEFAULT_SUBREDDIT}
