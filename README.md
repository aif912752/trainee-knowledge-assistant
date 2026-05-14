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
- **Node.js:** 20.x or 22.x (LTS recommended)
- **Package Manager:** pnpm 9+
- **API Keys:** 
  - **Z.AI (Primary):** Login to [z.ai](https://z.ai/), go to "API Keys", and create a new key.
  - **OpenRouter (Fallback):** Login to [openrouter.ai](https://openrouter.ai/), go to "Keys", and create a new key. (Required for fallback features)

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
*Note: If you encounter errors during install on Windows, ensure you have "Build Tools for Visual Studio" installed for native modules like `better-sqlite3` and `bcrypt`.*

3. **Setup environment variables**
```bash
cp .env.example .env
```
Edit `.env` and fill in your API keys (See [Environment Variables](#environment-variables) section below).

4. **Verify Installation (Optional but recommended)**
```bash
pnpm test:run
```
This will run 80+ unit tests to ensure your environment is set up correctly.

5. **Run development server**
```bash
pnpm dev
```
- Application: `http://localhost:3000`
- **Database:** The SQLite database will be initialized automatically on the first run in `data/app.db`.
- **Default Login:** `admin` / `admin123`

### Docker Deployment

#### Using Docker Compose (Recommended)

1. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys
```

2. **Start services**
```bash
docker-compose up -d --build
```

3. **View logs**
```bash
docker-compose logs -f app
```

Application will be available at `http://localhost:3001` (Note: Docker uses port 3001 by default to avoid conflicts with local dev).

## Environment Variables

| Variable | Description | Example |
| :--- | :--- | :--- |
| `ZAI_API_KEY` | Your Z.AI API Key | `your_key_here` |
| `ZAI_API_BASE` | Z.AI Anthropic Endpoint | `https://api.z.ai/api/anthropic` |
| `PRIMARY_MODEL` | Technical Model ID | `claude-3-5-sonnet-20241022` |
| `PRIMARY_MODEL_DISPLAY_NAME` | Friendly name for UI | `Claude 3.5 Sonnet` |
| `OPENROUTER_API_KEY` | Fallback AI Provider Key | `sk-or-v1-...` |
| `SESSION_SECRET` | Random string for cookies | `at-least-32-chars-long` |

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
