# Architecture Decisions

## Decision 1: Choosing SQLite (better-sqlite3) over PostgreSQL

### Context
เมื่อเริ่มโปรเจกต์ Mini Knowledge Assistant สำหรับ Junior Dev Assessment, จำเป็นต้องเลือก database ที่เหมาะสมกับ:
- Web application ขนาดเล็ก-กลาง
- In-memory assessment project (ไม่ใช่ production)
- ต้องการ code quality +5 คะแนน (SQL skills)
- Time constraint 5 วัน

### Alternatives Considered
1. **JSON File** - เก็บข้อมูลในไฟล์ .json
   - ข้อดี: ง่ายที่สุด, ไม่ต้อง install dependencies
   - ข้อเสีย: Load ทั้งไฟล์, race condition, ไม่มี type safety, ไม่ได้คะแนน code quality

2. **PostgreSQL/MySQL** - Production-grade database
   - ข้อดี: Scale ได้ดี, features ครบ
   - ข้อเสีย: ต้อง install แยก, setup ยาว, เกินความจำเป็นสำหรับ project นี้

3. **SQLite (better-sqlite3)** - Embedded SQL database
   - ข้อดี: SQL เต็มรูปแบบ, concurrency, type safety, file-based (ง่าย), ได้คะแนน code quality
   - ข้อเสีย: ต้องเขียน SQL เอง (ไม่มี ORM ในตอนแรก)

### Why SQLite
เลือก **better-sqlite3** เพราะ:
1. **Code Quality +5 คะแนน** - แสดง SQL skills และ database design
2. **Performance** - เร็วกว่า JSON file มาก, support concurrent access
3. **Portability** - เป็นไฟล์เดียว, backup ง่าย, deploy ง่าย (ไม่ต้อง setup database server)
4. **Type Safety** - เมื่อรวมกับ TypeScript interfaces ที่สร้างขึ้น
5. **เหมาะกับขนาด project** - รองรับ user ได้หลายพันคน (เพียงพอสำหรับ assessment)

### Trade-offs
- ❌ **ต้องเขียน SQL เอง** - ใช้เวลาเขียน raw queries แทนการใช้ ORM แต่ได้เรียนรู้ SQL ลึกซึ้งขึ้น
- ❌ **ไม่เหมาะกับ massive scale** - ถ้าโตขึ้นมากๆ อาจต้อง migrate ไป PostgreSQL แต่ตอนนี้เกินพอ
- ✅ **ยอมรับ trade-off** เพื่อได้คะแนน code quality และแสดงความสามารถด้าน database

---

## Decision 2: Choosing Nuxt 4 over Next.js

### Context
ต้องเลือก frontend framework สำหรับสร้าง web application ที่:
- User มีพื้นฐาน Vue.js อยู่แล้ว
- ต้องการ SSR (Server-Side Rendering)
- ต้องการ built-in backend (API routes)
- เป็น assessment project (ต้องทำเสร็จใน 5 วัน)

### Alternatives Considered
1. **Next.js** - React-based framework
   - ข้อดี: Ecosystem ใหญ่กว่า, community ขนาดใหญ่, shadcn/ui official
   - ข้อเสีย: User ไม่คุ้นเคย React, ต้องเรียนรู้ใหม่

2. **Nuxt 4** - Vue-based framework
   - ข้อดี: ใช้ Vue ที่คุ้นเคย, file-based routing, built-in API routes, shadcn-nuxt available
   - ข้อเสีย: Ecosystem เล็กกว่า Next.js, shadcn-nuxt เป็น port (ไม่ใช่ official)

### Why Nuxt 4
เลือก **Nuxt 4** เพราะ:
1. **Learning Curve** - คุ้นเคย Vue.js อยู่แล้ว ลดเวลา learning เหลือเพียง Nuxt-specific features
2. **Built-in Backend** - Server routes และ API handlers ในตัว, ไม่ต้อง setup backend แยก
3. **TypeScript Support** - First-class TypeScript support ดีมาก
4. **Productivity** - File-based routing, auto-imports, conventions over configuration ทำให้เร็ว
5. **shadcn-nuxt** - มี official port ของ shadcn/ui สำหรับ Nuxt แล้ว (พอดี user รู้)

### Trade-offs
- ❌ **Ecosystem เล็กกว่า** - Next.js มี library และ tools มากกว่า แต่ Nuxt ก็พอถึง
- ❌ **shadcn-nuxt เป็น port** - ไม่ใช่ official shadcn/ui แต่ก็ใช้งานได้ดี
- ✅ **Speed of Development** - เร็วกว่าการเรียนรู้ Next.js มาก
- ✅ **Confidence** - คุ้นเคย Vue ทำให้ลด error และ debug เร็ว

---

## Decision 3: Choosing z.ai API over Official Anthropic API

### Context
ต้องเลือก AI API provider สำหรับ Claude integration:
- Project เป็น assessment/student project (ไม่ใช่ production)
- **User มีบัญชี z.ai อยู่แล้วและใช้งานอยู่ปัจจุบัน**
- ต้องการ Claude models (Haiku ถูก, Sonnet ดี)
- ต้องการ start project ได้ทันทีโดยไม่ต้องสมัครบัญชีใหม่

### Alternatives Considered
1. **Official Anthropic API** (api.anthropic.com)
   - ข้อดี: Stable, secure, มี official support, เชื่อถือได้
   - ข้อเสีย: ต้องสมัครบัญชีใหม่, ต้อง setup billing, เสียเวลา

2. **OpenAI API** (GPT-3.5/4)
   - ข้อดี: Popular, ecosystem ใหญ่
   - ข้อเสีย: ไม่ใช่ Claude (assessment อาจไม่ approve), ต้องสมัครบัญชีใหม่

3. **z.ai API** (api.z.ai/api/anthropic) - Third-party Claude proxy
   - ข้อดี: **มีบัญชีอยู่แล้ว**, รู้จักระบบอยู่แล้ว, ถูกกว่า, API format เหมือน official 100%
   - ข้อเสีย: เป็น third-party proxy, มีความเสี่ยงเรื่อง privacy, reliability ต่ำกว่า official

### Why z.ai API
เลือก **z.ai API** เพราะ:
1. **มีบัญชีและใช้อยู่แล้ว** - หลักๆ เลย! ไม่ต้องสมัครใหม่, ไม่ต้อง setup อะไรเพิ่ม, ใช้ API key เดิมได้เลย
2. **Experience** - เคยใช้มาก่อน, รู้วิธีใช้งาน, รู้ limits และ behaviors, ไม่ต้องเรียนรู้ใหม่
3. **Speed** - Start development ได้ทันที ไม่ต้องรอ approve หรือ verify account
4. **Cost** - ถูกกว่า Official API (bonus: ประหยัดเงินไปในตัว)
5. **Compatibility** - API format เหมือนกับ Official Anthropic API 100% (เป็น proxy)

### Trade-offs
- ❌ **Security Risk** - เป็น third-party proxy, API key อยู่กับ z.ai (ยอมรับได้สำหรับ student project)
- ❌ **Reliability** - อาจมี downtime มากกว่า official แต่ยังไม่เคยมีปัญหาร้ายแรงจากการใช้งานจริง
- ❌ **Not Production-Ready** - ถ้าเป็น production จะเลือก Official API แน่นอน
- ✅ **Instant Start** - ไม่ต้องเสียเวลาสมัคร และ setup บัญชีใหม่
- ✅ **Familiarity** - รู้ระบบอยู่แล้ว ลด error จากการเรียนรู้ระบบใหม่

**Note:** ถ้าเป็น production application จะเลือก Official Anthropic API 100% แต่สำหรับ assessment project นี้ z.ai เป็นตัวเลือกที่สมดุลที่สุดระหว่างความสะดวกและความปลอดภัยที่ยอมรับได้

---

## Summary

ทั้ง 3 decisions นี้แสดงแนวคิดในการพัฒนา:

1. **Pragmatic over Perfect** - เลือกเครื่องมือที่เหมาะกับ context ไม่ใช่ที่ดีที่สุดเสมอไป
2. **Leverage Existing Skills** - ใช้สิ่งที่คุ้นเคย (Vue, SQL) เพื่อลด learning curve
3. **Balance Quality vs Constraints** - ยอมรับ trade-offs บางอย่างเพื่อได้ประโยชน์ใหญ่ (คะแนน, เวลา, งบประมาณ)

ทั้งหมดนี้เป็น decisions ที่ผ่านการคิดอย่างรอบคอบ และเหมาะสมกับ context ของ Junior Dev Assessment 2026
