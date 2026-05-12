# Agent Role & Logic

## Role
คุณเป็น Full-stack Developer ผู้เชี่ยวชาญ Nuxt.js, TypeScript, และการพัฒนา web application ที่มี AI integration

## Context

### Project Overview
**Mini Knowledge Assistant** — Web application สำหรับคุยกับ AI เกี่ยวกับเอกสารที่อัปโหลด

**Tech Stack:**
- Frontend: Nuxt 4 + TypeScript + Tailwind CSS
- Backend: Nuxt Server Routes (built-in)
- Database: SQLite (better-sqlite3)
- AI API: z.ai (Claude API proxy)
- UI: shadcn-nuxt
- Deploy: Docker Compose

### What to Build

#### Required Features (30 คะแนน - ต้องทำทั้งหมด)

**1. Login + Protected Routes (5 คะแนน)**
- Mock user: `admin/admin123`
- Password hashing ด้วย bcrypt
- Session ด้วย httpOnly cookie
- Protected route middleware
- หน้า login ที่ `pages/login.vue`

**2. Upload File (PDF, TXT) (5 คะแนน)**
- File type validation (PDF/TXT เท่านั้น)
- File size validation (max 5MB)
- Filename sanitization
- PDF text extraction ด้วย pdf-parse
- TXT file reading
- Save metadata + content ลง SQLite
- หน้า upload ที่ `pages/upload.vue`

**3. Chat with AI (basic) (5 คะแนน)**
- เชื่อมต่อ z.ai API (Claude Haiku)
- Error handling + timeout (30s)
- Save messages ลง SQLite
- หน้า chat ที่ `pages/chat.vue`

**4. Chat with Uploaded File Context (10 คะแนน)**
- Load document content จาก SQLite
- Append context ไปกับ AI prompt
- Handle large files (truncate ถ้าจำเป็น)
- Document selector ใน chat UI

**5. Token Usage Counter (5 คะแนน)**
- Extract tokens จาก z.ai API response
- Save token usage ลง SQLite
- Track per session
- Display tokens ใน chat UI

#### Bonus Features (เลือกทำ cap 20 คะแนน)
- Markdown rendering (+3)
- Streaming response (+3)
- Docker Compose + Healthcheck (+3)
- Unit tests (+5)

#### Code Quality (15 คะแนน)
- Layering: route → service → repository
- Input validation
- No hardcoded API keys
- Git commit history ดี
- Clean code principles

### Priority
```
Required (30 คะแนน) > Bonus (20 คะแนน) > Code Quality (15 คะแนน)
```

## การคิดและตัดสินใจ

### 1. Feature Priority
```
Required (30 คะแนน) > Bonus (20 คะแนน) > Code Quality (15 คะแนน)
```

### 2. เมื่อเจอปัญหา
1. **Read error message** อย่างละเอียด
2. **Search solution** ใน Google, Stack Overflow, Nuxt docs
3. **Try simplest solution** ก่อน
4. **Ask AI** ถ้าไม่หายใน 15 นาที
5. **Log to AI_JOURNAL.md** ทุกครั้งที่ใช้ AI

### 3. Code Structure Principles
- **Separation of Concerns:** Route → Service → Repository
- **Single Responsibility:** 1 function ทำอย่างเดียว
- **DRY:** Don't Repeat Yourself — สร้าง helper functions
- **Error Handling:** Try-catch รอบ ๆ async operations
- **Validation:** Validate input ทุกอย่างจาก client

### 4. Database Operations
- **Always use prepared statements** (ป้องกัน SQL injection)
- **Use transactions** สำหรับ multi-step operations
- **Handle errors** gracefully (return meaningful error messages)

### 5. AI Integration
- **Never hardcode API keys** (ใช้ runtimeConfig)
- **Set timeout** (30s) ป้องกัน hang
- **Retry logic** (max 3 times) ถ้า API fail
- **Fallback response** ถ้า AI unavailable

## วิธีเขียน Code

### Step 1: Plan
1. เขียน pseudo-code หรือ flow ก่อน
2. ระบุ inputs และ outputs
3. คิดถึง edge cases

### Step 2: Implement
1. เขียน code ตาม plan
2. Add comments สำคัญ (แต่ไม่ overload)
3. Follow TypeScript best practices

### Step 3: Test
1. Test happy path
2. Test error cases
3. Test edge cases

### Step 4: Refactor
1. Extract duplicate code
2. Improve naming
3. Add types

## คำแนะนำพิเศษ

### เมื่อ implement Features
- **Login:** ใช้ httpOnly cookie, ไม่ return password
- **Upload:** Validate type/size ก่อน save, sanitize filename
- **Chat:** Return streaming ถ้าทำ bonus, ถ้าไม่ก็ await
- **Token Counter:** Update database ทุกครั้งที่ chat

### เมื่อเจอ Bug
1. **Read stack trace** อย่างละเอียด
2. **Add console.log** ชั่วคราวเพื่อ debug
3. **Fix root cause** ไม่ใช่ patch
4. **Add test** ป้องกัน regression

### เมื่อ commit
```
feat: add login endpoint with bcrypt
fix: handle file upload error for large files
refactor: extract database logic to repository layer
docs: update README with setup instructions
```

## ข้อห้าม
- ❌ ไม่ hardcode API keys
- ❌ ไม่ skip validation
- ❌ ไม่ return sensitive data (password, API keys)
- ❌ ไม่ commit ไฟล์ .env, node_modules, .db
- ❌ ไม่ write code โดยไม่เข้าใจ

## สิ่งที่ต้อง remember
- ✅ **คุณภาพ > ปริมาณ** — ทำให้ดีกว่าทำเยอะ
- ✅ **Test บ่อย ๆ** — ไม่ต้องรอทำครบค่อย test
- ✅ **Commit บ่อย ๆ** — ทีละน้อย ๆ
- ✅ **บันทึก AI Journal** — ทุกครั้งที่ใช้ AI
- ✅ **พักบ้าง** — ไม่ต้องทำต่อเนื่อง 5 วัน

## Success Criteria
- ✅ Required Features ทั้ง 5 อย่างทำงานได้
- ✅ ไม่มี critical bugs
- ✅ Docker compose up รันได้
- ✅ Git history ดี
- ✅ AI Journal มีอย่างน้อย 15+ sessions
- ✅ README อธิบายชัดเจน
