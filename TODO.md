# TODO List - Mini Knowledge Assistant

## Project Setup
- [x] Create Nuxt project with pnpm (minimal template)
- [x] Install dependencies
  - [x] shadcn-nuxt
  - [x] better-sqlite3
  - [x] pdf-parse
  - [x] bcrypt (not bcryptjs)
  - [x] @types/bcrypt
  - [x] @types/better-sqlite3
- [x] Setup .env file
- [x] Initialize database schema
- [x] Test database connection

## Required Features (30 คะแนน)

### Feature 1: Login + Protected Routes (5 คะแนน)
- [x] Create database schema for users table
- [x] Implement password hashing with bcrypt
- [x] Implement login API endpoint (`server/api/auth/login.post.ts`)
- [x] Implement session management with httpOnly cookie
- [x] Create login page (`pages/login.vue`)
- [x] Add protected route middleware
- [x] Test login with admin/admin123
- [x] Test unauthorized access

### Feature 2: Upload File (5 คะแนน)
- [x] Create documents table schema
- [x] Implement upload API endpoint (`server/api/upload/post.post.ts`)
- [x] Add file type validation (PDF/TXT only)
- [x] Add file size validation (max 5MB)
- [x] Implement filename sanitization
- [x] Implement PDF text extraction with pdf-parse
- [x] Implement TXT file reading
- [x] Save document metadata to database
- [x] Create upload page (`app/pages/upload.vue`)
- [ ] Test upload with valid PDF
- [ ] Test upload with valid TXT
- [ ] Test upload with invalid file type
- [ ] Test upload with oversized file

### Feature 3: Chat with AI (5 คะแนน)
- [x] Create messages table schema
- [ ] Implement chat API endpoint (`server/api/chat/post.post.ts`)
- [ ] Integrate z.ai API (Claude Haiku) using $fetch
- [ ] Add error handling for API failures
- [ ] Add timeout handling (30s)
- [ ] Save messages to database
- [ ] Create chat page (`pages/chat.vue`)
- [ ] Test basic chat functionality
- [ ] Test API error handling
- [ ] Test timeout handling

### Feature 4: Chat with File Context (10 คะแนน)
- [ ] Modify chat API to accept document_id
- [ ] Load document content from database
- [ ] Append document context to AI prompt
- [ ] Handle large file content (truncate if needed)
- [ ] Test chat with document context
- [ ] Test with PDF document
- [ ] Test with TXT document
- [ ] Test with non-existent document

### Feature 5: Token Usage Counter (5 คะแนน)
- [x] Create token_usage table schema
- [ ] Extract token usage from z.ai API response
- [ ] Save token usage to database
- [ ] Implement session tracking
- [ ] Display token usage in chat UI
- [ ] Calculate total tokens per session
- [ ] Test token counting
- [ ] Test session tracking

## Bonus Features (เลือกทำ cap 20 คะแนน)

### Markdown Rendering (+3 คะแนน)
- [ ] Install markdown rendering library
- [ ] Parse AI responses for markdown
- [ ] Render markdown in chat UI
- [ ] Test markdown rendering

### Streaming Response (+3 คะแนน)
- [ ] Implement streaming in chat API
- [ ] Handle streaming in frontend
- [ ] Display streaming tokens
- [ ] Test streaming functionality

### Docker Compose (+3 คะแนน)
- [ ] Create Dockerfile
- [ ] Create docker-compose.yml
- [ ] Add healthcheck
- [ ] Test docker compose up
- [ ] Test application in Docker

### Unit Tests (+5 คะแนน)
- [x] Setup test framework (Vitest)
- [x] Write tests for auth service
- [ ] Write tests for chat service
- [x] Write tests for document service
- [x] Achieve 40%+ coverage (65 tests passing)
- [x] Run tests

## Code Quality (15 คะแนน)
- [x] Implement repository layer (user.repository.ts, etc.)
- [x] Remove hardcoded values (use .env)
- [ ] Implement service layer (auth.service.ts, chat.service.ts, etc.)
- [ ] Add input validation to all API endpoints
- [ ] Add CORS configuration
- [ ] Add path sanitization
- [ ] Refactor large files (>500 lines)
- [ ] Improve naming conventions
- [ ] Add error handling
- [ ] Review Git commit history

## Documentation
- [x] Create AI_JOURNAL.md
- [ ] Update AI_JOURNAL.md with new sessions
- [ ] Create README.md with setup instructions
- [ ] Create DECISIONS.md with 3 key decisions
- [ ] Add comments to complex code
- [ ] Document API endpoints

## Deployment
- [ ] Test application locally
- [ ] Test Docker Compose
- [ ] Fix any remaining bugs
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Test deployment

## Progress Tracking
- **Day 1:** Project Setup + Feature 1-2
- **Day 2:** Feature 3-4
- **Day 3:** Feature 5 + Code Quality
- **Day 4:** Bonus Features + Documentation
- **Day 5:** Testing + Deployment + Part 2-4

## Current Status
📅 **Day:** 1/5
⏱️ **Time:** Feature 1 Implementation
🎯 **Focus:** Login + Protected Routes
✅ **Completed:** Project Setup, Database Schema, Repositories, Auth Service
🔄 **In Progress:** Login API Endpoint
📋 **Next:** Create login page UI, Protected middleware
