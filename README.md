# Mini Knowledge Assistant

A web application for chatting with AI about uploaded documents. Built with Nuxt.js, SQLite, and Claude AI API.

## Tech Stack

- **Frontend:** Nuxt 4 + TypeScript + Tailwind CSS
- **Backend:** Nuxt Server Routes (built-in)
- **Database:** SQLite (better-sqlite3)
- **AI API:** z.ai (Claude API proxy)
- **UI:** shadcn-nuxt
- **Deployment:** Docker Compose

## Features

### Required Features (30 คะแนน)
- [x] Login + Protected Routes (5 คะแนน)
- [ ] Upload File (PDF, TXT) (5 คะแนน)
- [ ] Chat with AI (basic) (5 คะแนน)
- [ ] Chat with Uploaded File Context (10 คะแนน)
- [ ] Token Usage Counter (5 คะแนน)

### Bonus Features (เลือกทำ cap 20 คะแนน)
- [ ] Markdown rendering (+3)
- [ ] Streaming response (+3)
- [ ] Docker Compose + Healthcheck (+3)
- [ ] Unit tests (+5)

## Setup & Run

### Prerequisites
- Node.js 18+
- pnpm 8+
- z.ai API key

### Installation

1. **Clone repository**
```bash
git clone https://github.com/YOUR_USERNAME/trainee-knowledge-assistant.git
cd trainee-knowledge-assistant
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
```

Edit `.env`:
```bash
ZAI_API_KEY=your-zai-api-key-here
DATABASE_PATH=./data/app.db
ZAI_API_BASE=https://api.z.ai/api/anthropic
```

4. **Initialize database**
```bash
pnpm db:init
```

5. **Run development server**
```bash
pnpm dev
```

Application will be available at `http://localhost:3000`

### Docker Deployment

```bash
docker-compose up
```

Application will be available at `http://localhost:3000`

## Usage

### Login
- **Username:** admin
- **Password:** admin123

### Upload Document
1. Go to `/upload`
2. Select PDF or TXT file (max 5MB)
3. Click "Upload"

### Chat with AI
1. Go to `/chat`
2. Type message and send
3. AI will respond

### Chat with Document
1. Select document from dropdown
2. Type question about document
3. AI will answer based on document content

### View Token Usage
- Token usage is displayed after each message
- Total tokens per session is shown in chat header

## Architecture

### Layer Structure
```
pages/ (Frontend)
  → server/api/ (Routes)
    → services/ (Business Logic)
      → repositories/ (Data Access)
        → database/ (SQLite)
```

### Database Schema
```sql
users (id, username, password_hash, created_at)
documents (id, user_id, filename, file_type, file_size, content, created_at)
messages (id, user_id, document_id, role, content, tokens, created_at)
token_usage (id, user_id, session_id, tokens, created_at)
```

## Development

### Project Structure
```
trainee-knowledge-assistant/
├── server/
│   ├── api/           # API endpoints
│   ├── services/      # Business logic
│   ├── repositories/  # Data access
│   └── db/           # Database initialization
├── pages/            # Frontend pages
├── components/       # Vue components
├── data/            # SQLite database
├── doc/             # Documentation
├── .env             # Environment variables
├── nuxt.config.ts   # Nuxt configuration
├── AI_JOURNAL.md    # AI usage log
├── DECISIONS.md     # Architecture decisions
└── README.md        # This file
```

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:init      # Initialize database
pnpm test         # Run tests
```

## Known Issues

- [ ] Large file upload may timeout (need to implement chunked upload)
- [ ] Token counter may be inaccurate for streaming responses
- [ ] No rate limiting implemented yet
- [ ] Session expiration not implemented

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ HTTP-only cookies for sessions
- ✅ Input validation on all endpoints
- ✅ File type validation
- ✅ SQL injection prevention (prepared statements)
- ⚠️ No rate limiting (planned)
- ⚠️ No session expiration (planned)

## License

MIT

## Author

Created for Junior Dev Assessment 2026

---

**Last Updated:** 2025-01-12
**Status:** In Development (Day 1/5)
