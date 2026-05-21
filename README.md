# 🤖 RedditBot — Reddit Automation Platform

A full-stack Reddit automation app with a **Next.js** frontend and **FastAPI** backend. Schedule posts, auto-reply to comments, monitor keywords, and more.

---

## 📁 Project Structure

```
reddit-automator/
├── backend/          # FastAPI + Python
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── models/
│   │   ├── user.py
│   │   └── automation.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── automations.py
│   │   └── reddit.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── reddit_service.py
│   │   └── scheduler_service.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # Next.js 15 + TypeScript
    ├── app/
    │   ├── auth/login/
    │   ├── auth/register/
    │   └── dashboard/
    │       ├── page.tsx
    │       └── automations/
    │           ├── page.tsx
    │           ├── new/page.tsx
    │           └── [id]/page.tsx
    ├── components/
    ├── lib/
    └── types/
```

---

## 🚀 Setup

### 1. Reddit App Setup

1. Go to https://www.reddit.com/prefs/apps
2. Click **"Create app"**
3. Choose **"web app"**
4. Set redirect URI to `http://localhost:3000`
5. Copy your `client_id` and `client_secret`

To get a `REDDIT_ACCESS_TOKEN` (refresh token), use the Reddit OAuth flow or PRAW's interactive helper:

```python
import praw
reddit = praw.Reddit(
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_SECRET",
    redirect_uri="http://localhost:8080",
    user_agent="myapp"
)
print(reddit.auth.url(["submit", "identity", "read"], "...", "permanent"))
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env with your Reddit credentials

uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

App: http://localhost:3000

---

## ✨ Features

| Feature | Description |
|---|---|
| **User Auth** | Register/login with email + password (JWT) |
| **Scheduled Post** | Post text or link to any subreddit at a set time |
| **Auto Reply** | Automatically reply to a specific Reddit post |
| **Keyword Monitor** | Watch subreddit comments for keywords and auto-reply |
| **Scheduled Comment** | Post a comment on an existing post on a schedule |
| **Recurring Jobs** | Use cron expressions for repeating automations |
| **Run Now** | Trigger any automation instantly |
| **Pause/Resume** | Control active automations |
| **Dashboard** | Stats, recent activity, quick actions |

---

## 🔧 Automation Types

### Scheduled Post
Posts a text or link to a subreddit at a specified time.
- Required: `subreddit`, `post_title`, `scheduled_at` or `cron_expression`

### Auto Reply  
Replies to a specific Reddit post when triggered.
- Required: `reply_to_post_id`, `reply_template`, `scheduled_at`

### Keyword Reply
Monitors recent comments in a subreddit for a keyword and replies.
- Required: `subreddit`, `trigger_keyword`, `reply_template`

### Scheduled Comment
Posts a comment on an existing post at a scheduled time.
- Required: `subreddit`, `post_title`, `scheduled_at`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=smma:social-media-marketing-agent:v2.0 (by /u/your_username)
REDDIT_OAUTH_SCOPES=submit identity read
REDDIT_APP_TYPE=web
REDDIT_ACCESS_TOKEN=your_refresh_token
REDDIT_DEFAULT_SUBREDDIT=test
SECRET_KEY=change-this-to-a-random-secret
DATABASE_URL=sqlite+aiosqlite:///./reddit_automator.db
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/automations/` | List automations |
| POST | `/api/automations/` | Create automation |
| GET | `/api/automations/{id}` | Get automation |
| PUT | `/api/automations/{id}` | Update automation |
| DELETE | `/api/automations/{id}` | Delete automation |
| POST | `/api/automations/{id}/run` | Run now |
| POST | `/api/automations/{id}/pause` | Pause |
| POST | `/api/automations/{id}/resume` | Resume |
| GET | `/api/reddit/me` | Reddit account info |
| GET | `/api/reddit/posts/{subreddit}` | Browse subreddit |
