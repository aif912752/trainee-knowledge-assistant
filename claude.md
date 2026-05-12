# Technical Constraints & Requirements

## Tech Stack
- **Frontend:** Nuxt 3 + TypeScript + Tailwind CSS
- **Backend:** Nuxt Server Routes (built-in)
- **Database:** SQLite (better-sqlite3)
- **AI API:** z.ai (Claude API proxy)
- **UI:** shadcn-nuxt
- **Deploy:** Docker Compose

## Required Features (30 คะแนน)
1. ✅ Login + Protected Routes (5 คะแนน)
   - Mock user: admin/admin123
   - Use bcrypt for password hashing
   - HTTP-only cookies for session

2. ✅ Upload File (PDF, TXT) (5 คะแนน)
   - Validate file type (PDF/TXT only)
   - Validate file size (max 5MB)
   - Sanitize filename
   - Extract text content for PDF

3. ✅ Chat with AI (basic) (5 คะแนน)
   - Call z.ai API (Claude Haiku)
   - Error handling
   - Timeout handling (30s)

4. ✅ Chat with Uploaded File Context (10 คะแนน)
   - Read document content from SQLite
   - Send to AI with user message
   - Handle large files

5. ✅ Token Usage Counter (5 คะแนน)
   - Track tokens per message
   - Show total per session
   - Store in database

## Bonus Features (เลือกทำ cap 20 คะแนน)
- [ ] Markdown rendering (+3)
- [ ] Streaming response (+3)
- [ ] Docker Compose + Healthcheck (+3)
- [ ] Unit tests (+5)

## Code Quality (15 คะแนน)
- Layering: route → service → repository
- Naming conventions: camelCase for TS, snake_case for DB
- No god files (>500 lines)
- Input validation
- No hardcoded API keys (use .env)
- CORS configuration
- Path sanitization

## Git Commit History
- Commit แยกเป็น logical units
- Message format: `feat: add login endpoint`, `fix: handle upload error`
- ไม่ commit ก้อนเดียว

## Database Schema
```sql
users (id, username, password_hash, created_at)
documents (id, user_id, filename, original_name, file_type, file_size, content, created_at)
messages (id, user_id, document_id, role, content, tokens, created_at)
token_usage (id, user_id, session_id, tokens, created_at)
```

## Environment Variables
```bash
ZAI_API_KEY=your-key
DATABASE_PATH=./data/app.db
ZAI_API_BASE=https://api.z.ai/api/anthropic
```

## File Structure
```
server/
  api/
    auth/login.post.ts
    upload/post.post.ts
    chat/post.post.ts
    documents/
  db/
    init.ts
    schema.sql
  services/
    auth.service.ts
    chat.service.ts
    document.service.ts
  repositories/
    user.repository.ts
    document.repository.ts
    message.repository.ts
pages/
  index.vue
  login.vue
  chat.vue
  upload.vue
components/
  ui/ (shadcn-nuxt)
```
