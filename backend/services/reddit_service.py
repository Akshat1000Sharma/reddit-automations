import praw
from config import settings
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

def get_reddit_client() -> praw.Reddit:
    return praw.Reddit(
        client_id=settings.REDDIT_CLIENT_ID,
        client_secret=settings.REDDIT_CLIENT_SECRET,
        user_agent=settings.REDDIT_USER_AGENT,
        refresh_token=settings.REDDIT_ACCESS_TOKEN if settings.REDDIT_ACCESS_TOKEN else None,
    )

async def submit_text_post(subreddit: str, title: str, content: str) -> dict:
    try:
        reddit = get_reddit_client()
        sub = reddit.subreddit(subreddit)
        submission = sub.submit(title=title, selftext=content)
        return {
            "success": True,
            "post_id": submission.id,
            "post_url": f"https://reddit.com{submission.permalink}",
            "title": submission.title,
        }
    except Exception as e:
        logger.error(f"Error submitting post: {e}")
        return {"success": False, "error": str(e)}

async def submit_link_post(subreddit: str, title: str, url: str) -> dict:
    try:
        reddit = get_reddit_client()
        sub = reddit.subreddit(subreddit)
        submission = sub.submit(title=title, url=url)
        return {
            "success": True,
            "post_id": submission.id,
            "post_url": f"https://reddit.com{submission.permalink}",
        }
    except Exception as e:
        logger.error(f"Error submitting link post: {e}")
        return {"success": False, "error": str(e)}

async def reply_to_post(post_id: str, reply_text: str) -> dict:
    try:
        reddit = get_reddit_client()
        submission = reddit.submission(id=post_id)
        comment = submission.reply(reply_text)
        return {
            "success": True,
            "comment_id": comment.id,
            "comment_url": f"https://reddit.com{comment.permalink}",
        }
    except Exception as e:
        logger.error(f"Error replying to post: {e}")
        return {"success": False, "error": str(e)}

async def reply_to_comment(comment_id: str, reply_text: str) -> dict:
    try:
        reddit = get_reddit_client()
        comment = reddit.comment(id=comment_id)
        new_comment = comment.reply(reply_text)
        return {
            "success": True,
            "comment_id": new_comment.id,
        }
    except Exception as e:
        logger.error(f"Error replying to comment: {e}")
        return {"success": False, "error": str(e)}

async def get_subreddit_posts(subreddit: str, limit: int = 10, sort: str = "hot") -> List[dict]:
    try:
        reddit = get_reddit_client()
        sub = reddit.subreddit(subreddit)
        posts = []
        feed = getattr(sub, sort)(limit=limit)
        for post in feed:
            posts.append({
                "id": post.id,
                "title": post.title,
                "author": str(post.author),
                "score": post.score,
                "url": post.url,
                "permalink": f"https://reddit.com{post.permalink}",
                "num_comments": post.num_comments,
                "created_utc": post.created_utc,
                "is_self": post.is_self,
                "selftext": post.selftext[:300] if post.selftext else "",
            })
        return posts
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        return []

async def monitor_keyword_and_reply(subreddit: str, keyword: str, reply_template: str, limit: int = 10) -> dict:
    try:
        reddit = get_reddit_client()
        sub = reddit.subreddit(subreddit)
        matched = 0
        errors = 0
        for comment in sub.comments(limit=limit):
            if keyword.lower() in comment.body.lower():
                try:
                    comment.reply(reply_template)
                    matched += 1
                except Exception:
                    errors += 1
        return {"success": True, "matched": matched, "errors": errors}
    except Exception as e:
        return {"success": False, "error": str(e)}

async def get_reddit_identity() -> dict:
    try:
        reddit = get_reddit_client()
        me = reddit.user.me()
        if me:
            return {"success": True, "username": me.name, "karma": me.link_karma + me.comment_karma}
        return {"success": False, "error": "Not authenticated"}
    except Exception as e:
        return {"success": False, "error": str(e)}
