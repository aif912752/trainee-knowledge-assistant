# Mini Knowledge Assistant

A web application for chatting with AI about uploaded documents. Built with Nuxt.js, SQLite, and Claude AI API.

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?logo=nuxt.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57?logo=sqlite)

## Tech Stack

- **Frontend:** Nuxt 4 + TypeScript + Tailwind CSS
- **Backend:** Nuxt Server Routes (built-in)
- **Database:** SQLite (better-sqlite3)
- **AI API:** z.ai (Claude/Gemini) with OpenRouter fallback
- **UI:** shadcn-nuxt + Lucide Icons
- **Markdown:** markdown-it + highlight.js
- **Deployment:** Docker Compose

## Features

### Required Features (30 คะแนน)
- [x] Login + Protected Routes (5 คะแนน)
- [x] Upload File (PDF, TXT) (5 คะแนน)
- [x] Chat with AI (basic) (5 คะแนน)
- [x] Chat with Uploaded File Context (10 คะแนน)
- [x] Token Usage Counter (5 คะแนน)

### Bonus Features (เลือกทำ cap 20 คะแนน)
- [x] Markdown rendering (+3)
- [x] Streaming response (+3)
- [x] Docker Compose + Healthcheck (+3)
- [x] Unit tests (+5)

## Setup & Run

### Prerequisites
- Node.js 20+
- pnpm 9+
- z.ai API key (or OpenRouter API key)

### Local Development

1. **Clone repository**
```bash
git clone https://github.com/aif912752/trainee-knowledge-assistant.git
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
ZAI_API_BASE=https://api.z.ai/api/anthropic
PRIMARY_MODEL=claude-sonnet-4-5-20250929
SESSION_SECRET=your-random-secret-here
```

4. **Run development server**
```bash
pnpm dev
```

Application will be available at `http://localhost:3000`

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

2. **Start services**
```bash
docker-compose up -d
```

3. **View logs**
```bash
docker-compose logs -f app
```

4. **Stop services**
```bash
docker-compose down
```

Application will be available at `http://localhost:3000`

#### Manual Docker Build

```bash
# Build image
docker build -t trainee-knowledge-assistant .

# Run container
docker run -p 3000:3000 \
  -e ZAI_API_KEY=your-key \
  -e SESSION_SECRET=your-secret \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/storage:/app/storage \
  trainee-knowledge-assistant
```

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
app/pages/ (Frontend)
  → server/api/ (Routes)
    → services/ (Business Logic)
      → repositories/ (Data Access)
        → database/ (SQLite)
```

### Project Structure
```
trainee-knowledge-assistant/
├── app/                    # Nuxt 4 app directory
│   ├── components/         # Vue components (shadcn-nuxt)
│   ├── composables/        # Vue composables
│   ├── pages/              # Route pages
│   └── utils/              # Frontend utilities
├── server/                 # Server-side code
│   ├── api/                # API endpoints
│   ├── middleware/         # Server middleware
│   ├── plugins/            # Nitro plugins (DI)
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic layer
│   └── utils/              # Server utilities
├── shared/                 # Shared frontend/backend code
│   ├── validations/        # Zod schemas
│   ├── errors.ts           # Error classes
│   └── tokens.ts           # Token utilities
├── storage/                # Uploaded files (gitignored)
├── data/                   # Database file (gitignored)
├── Dockerfile              # Docker image
├── docker-compose.yml      # Docker Compose config
├── nuxt.config.ts          # Nuxt configuration
├── AI_JOURNAL.md           # AI development log
├── DECISIONS.md            # Architecture decisions
└── README.md               # This file
```

### Database Schema
```sql
users (id, username, password_hash, created_at)
sessions (token, user_id, expires_at)
documents (id, user_id, filename, original_name, file_type, file_size, content, created_at)
messages (id, user_id, document_id, role, content, tokens, model, created_at)
token_usage (id, user_id, session_id, tokens, created_at)
```

## Development

### Available Scripts
```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm test             # Run tests (vitest)
pnpm test:run         # Run tests once
pnpm test:coverage    # Run tests with coverage
```

## Known Issues

- [x] Large file upload may timeout (handled with pdfjs-dist)
- [x] Token counter inaccurate for streaming (fixed with AiTokenUsage)
- [x] No rate limiting (added nuxt-security rate limiter)
- [x] Session expiration not implemented (added sessions table)

## Security Considerations

- ✅ Passwords hashed with bcrypt (cost 10)
- ✅ Secure random session tokens (256-bit)
- ✅ HTTP-only cookies for sessions
- ✅ Input validation on all endpoints (Zod)
- ✅ File type validation (PDF/TXT only)
- ✅ File size validation (max 5MB)
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configuration
- ✅ Rate limiting on login endpoint
- ✅ Singleton services with DI pattern
- ✅ CSP configuration for Web Workers (Blob support)

## License

MIT

## Author

Created for Junior Dev Assessment 2026

---

**Last Updated:** 2025-05-13
**Status:** Complete ✅ (65/65 points)
