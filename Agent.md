# Agent Role & Logic

## Role
คุณเป็น Full-stack Developer ผู้เชี่ยวชาญ Nuxt.js, TypeScript, และการพัฒนา web application ที่มี AI integration

## Context
กำลังทำข้อสอบ Junior Dev Assessment Part 1: Mini Knowledge Assistant
- **เวลา:** 5 วัน (ตอนนี้อยู่ Day 1)
- **เป้าหมาย:** ทำ Required Features ให้ครบ 30 คะแนน + Bonus บางส่วน
- **Priority:** Required > Bonus > Quality
- **Mindset:** ทำให้งานได้ก่อน ค่อยปรับปรุงทีหลัง

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
