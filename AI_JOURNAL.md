# AI Usage Journal

## Session 1: Planning Assessment Strategy

**Prompt:**
> ถ้าจะทำข้อแรกก่อน นายว่าดีไหม

**AI Response:**
แนะนำให้ทำ Part 1 ก่อนเพราะ:
- คะแนนสูงสุด (65 คะแนน = 36% ของเกณฑ์ผ่าน)
- ใช้เวลาเยอะที่สุด (~20 ชั่วโมง)
- ได้ base คะแนนที่แข็งแรง
- แนะนำแผน 5 วัน

**My Adjustment:**
ตัดสินใจทำ Part 1 ก่อนเพราะถนัด coding มากกว่า Part อื่น

---

## Session 2: Initial Tech Stack Research

**Prompt:**
> Part 1 มีคำแนะนำในการเลือก Tech Stack ที่ง่ายและรวดเร็วไหม

**AI Response:**
แนะนำ Tech Stack ที่เร็วที่สุด:
- Frontend: Next.js 14 + App Router (default)
- Backend: API Routes (built-in)
- Database: JSON file (ง่ายสุด) หรือ SQLite (ดีกว่า)
- Vector DB: เริ่มไม่ใช้ก่อน
- AI API: Claude API (Haiku ถูก, Sonnet ดี)
- UI: shadcn/ui (ประหยัดเวลา)

เปรียบเทียบ JSON vs SQLite:
- JSON = ง่าย, ไม่ต้อง install, แต่ load ทั้งไฟล์, race condition, ไม่มี type
- SQLite = SQL query, concurrency, type safety, แต่ต้อง install + รู้ SQL

**My Adjustment:**
ผมสนใจ Nuxt.js มากกว่า Next.js เพราะเคยใช้ Vue มาก่อน
จะถามต่อเรื่อง n8n vs Nuxt API และ shadcn สำหรับ Nuxt

---

## Session 3: Nuxt-Specific Tech Stack Decisions

**Prompt:**
> อยากใช้ Nuxt.js และในส่วนตัวแชทคิดว่าจะใช้ n8n หรือจะใช้ api ในตัว nuxt แทนดี แบบไหนง่ายกว่า? ส่วน Database: JSON file vs SQLite ขอความต่างและข้อจำกัด และจะใช้ Claude API (https://api.z.ai/api/anthropic) กับ shadcn/ui

**AI Response:**
1. **n8n vs Nuxt API Routes:**
   - n8n = workflow automation tool ใช้สำหรับ automation
   - n8n ไม่เหมาะ: overkill, deploy ยาก (2 services), ช้า, debug ยาก
   - **แนะนำ: Nuxt API Routes** (built-in, เร็ว, TypeScript, ง่าย)

2. **JSON vs SQLite (ละเอียด):**
   | JSON File | SQLite |
   |-----------|--------|
   | ง่าย, ไม่ต้อง install | ต้อง install |
   | Load ทั้งไฟล์, ช้าเมื่อข้อมูลเยอะ | SQL query ได้ |
   | Race condition | Concurrency |
   | ไม่มี type safety | Type safety |
   | เหมาะ: < 1,000 records | เหมาะ: production |

3. **Claude API Warning:**
   - api.z.ai = third-party proxy ⚠️ ความเสี่ยง: data privacy, API key theft, reliability
   - **แนะนำ: Official API** (api.anthropic.com) ปลอดภัยกว่า

4. **shadcn/ui Warning:**
   - shadcn/ui = React/Next.js เท่านั้น ❌ ไม่รองรับ Nuxt
   - **แนะนำ: Nuxt UI** (เป็น shadcn version สำหรับ Nuxt)

**My Adjustment:**
ผมชี้แจงว่า:
1. **n8n:** ยอมรับ จะใช้ Nuxt API Routes ตามที่แนะนำ
2. **SQLite:** เลือก SQLite เพราะเคยใช้ SQL และอยากได้ code quality +5 คะแนน
3. **z.ai:** ขอเลือกใช้ z.ai เพราะเคยใช้, ถูกกว่า, ชำระเงินง่าย (รองรับไทย)
4. **shadcn:** ชี้แจงว่ามี shadcn-nuxt official port แล้ว ใช้ `nuxi module add shadcn-nuxt`

---

## Session 4: Final Tech Stack Confirmation

**Prompt:**
> งั้นใช้ Nuxt API Routes + SQLite สำหรับ API Claude ความเสี่ยงมันมีอยู่ในทุกระบบแหละ แม้แต่ Official เองก็เคยมีประวัติข้อมูลหลุด แต่สำหรับ z.ai มันคือเครื่องมือที่สมดุลที่สุดระหว่าง ความปลอดภัยที่ยอมรับได้ กับ ต้นทุนที่คุ้มค่า ในการพัฒนาโปรเจกต์ตอนนี้ และ z.ai  เป็นแพลตฟอร์มที่ค่อนข้างเป็นที่รู้จักในหมู่ Developer โดยเฉพาะในฝั่งที่ต้องการเข้าถึง Model หลากหลายค่าย ในราคาที่ถูกลงและชำระเงินง่าย ส่วน shadcn-vue / shadcn-nuxt: ตอนนี้มี Official Port สำหรับ Vue และ Nuxt โดยเฉพาะ ใช้งานได้เหมือนฝั่ง React โดยใช้ nuxi module add shadcn-nuxt

**AI Response:**
ยอมรับความเห็น และขอโทษที่ข้อมูลล้าสมัยเรื่อง shadcn-nuxt
ยอมรับการตัดสินใจใช้ z.ai และ shadcn-nuxt
พร้อมโครงสร้าง project และตัวอย่าง code

**My Adjustment:**
ยืนยัน Tech Stack สุดท้าย:
1. **Nuxt API Routes** — ใช้ built-in, เร็ว, TypeScript
2. **SQLite** — เริ่มต้นด้วย SQLite เลย (ไม่ใช่ JSON)
   - เหตุผล: มีประสบการณ์ SQL, อยากได้คะแนน code quality
3. **z.ai** — ใช้ z.ai API
   - เหตุผล: เคยใช้, ถูกกว่า, ชำระเงินง่ายในไทย
4. **shadcn-nuxt** — ใช้ official port
   - Install: `npx nuxi module add shadcn-nuxt`

---

## Session 5: Creating Nuxt Project

**Prompt:**
> Create Nuxt project with pnpm เลือก template อะไร แต่เราจะใช้ shadcn-nuxt

**AI Response:**
แนะนำให้เลือก `minimal` template เพราะ:
- สะอาด ไม่มีอะไรมากัดกับ
- เราจะติดตั้ง shadcn-nuxt เอง
- ไม่ conflict กับ Nuxt UI
- ประหยัดเวลา

**My Adjustment:**
เลือก `minimal` template ตามที่แนะนำ
ตอบคำถามใน terminal:
- Template: minimal
- TypeScript: Yes
- Git init: No

---

## Session 6: Setting Up Documentation Files

**Prompt:**
> Create Nuxt project ด้วย pnpm ยังไม่เสร็จ และขอให้สร้างไฟล์ .md สำหรับให้ Agent อ่าน

**AI Response:**
ช่วยสร้างไฟล์ .md ทั้งหมด:
1. AI_JOURNAL.md — บันทึกการใช้ AI
2. claude.md — ข้อกำหนดทางเทคนิค
3. Agent.md — บทบาทและตรรกะการคิด
4. TODO.md — Checklist งานทั้งหมด
5. README.md — คู่มือการติดตั้ง
6. doc/user-story.md — ใครทำอะไร เพื่ออะไร
7. doc/wireframe.md — บรรยายโครงสร้างหน้าจอ
8. doc/test-case.md — เทสเคสทั้งหมด

**My Adjustment:**
สร้างไฟล์ทั้งหมดใหม่ใน `D:\junior-dev-assessment-2026\part-1-coding\trainee-knowledge-assistant`

---

## Session 7: Updating Agent.md

**Prompt:**
> แล้วไฟล์ Agent.md แก้ไขที ไม่ต้องบอกว่ากำลังทำข้อสอบ แต่อยากจะบอกลายละเอียดงานที่ต้องทำแทน

**AI Response:**
แก้ไฟล์ Agent.md:
- เปลี่ยนจาก "กำลังทำข้อสอบ..." เป็น "Project Overview" พร้อมรายละเอียด
- เพิ่ม "What to Build" พร้อม 5 Required Features ละเอียด
- เพิ่ม acceptance criteria สำหรับแต่ละ feature

**My Adjustment:**
อัปเดต Agent.md แล้ว push ไป GitHub:
- Remove exam context
- Add detailed project requirements
- List all 5 required features with acceptance criteria

---

## Session 8: Uploading to GitHub

**Prompt:**
> งั้นอัพไป git ก่อน โดยสร้าง repo โดยใช้ gh

**AI Response:**
ช่วยอัพไป GitHub:
1. Initialize git
2. Initial commit: "feat: initialize Nuxt 3 project with documentation"
3. Create repo with `gh repo create trainee-knowledge-assistant --public`
4. Push to GitHub

**My Adjustment:**
อัพไป GitHub สำเร็จ:
- Repository URL: https://github.com/aif912752/trainee-knowledge-assistant
- All documentation files included
- Initial commit with proper format

---

## Session 9: Cloning to New Location

**Prompt:**
> เรา clone project มาแล้วที่ "D:\Github\trainee-knowledge-assistant" ช่วยไปยังโฟลเดอร์นั้นแทนที พร้อมบันทึก AI_JOURNAL ตลอดทุกครั้งที่ prompt

**AI Response:**
ยอมรับที่จะย้ายไปทำงานที่ `D:\Github\trainee-knowledge-assistant`
จะสร้างไฟล์ .md ทั้งหมดใหม่ในโฟลเดอร์ใหม่
อัปเดต AI_JOURNAL.md ใหม่ทุกครั้งที่ prompt

**My Adjustment:**
ย้ายไปทำงานที่ `D:\Github\trainee-knowledge-assistant`
ตอนนี้ทุกครั้งที่ prompt จะอัปเดต AI_JOURNAL.md ทันที

---

## Tech Stack สรุป

```
Frontend:    Nuxt 4 + TypeScript + Tailwind CSS
Backend:     Nuxt Server Routes (built-in)
Database:    SQLite (better-sqlite3)
Vector DB:   (skip RAG ก่อน)
AI API:      z.ai (Claude API proxy)
UI:          shadcn-nuxt
Deploy:      Docker Compose
```

---

## Current Working Directory

**Location:** `D:\Github\trainee-knowledge-assistant`

---

---

## Session 10: Installing Dependencies

**Prompt:**
> เราได้เริ่ม Install dependencies ไปบ้างแล้ว และในส่วน import { provideSSRWidth } from '@vueuse/core' ช่วยติดตั้ง vueuse/core ให้ที

**AI Response:**
ติดตั้ง @vueuse/core (ไม่ใช่ vueuse/core) ด้วย pnpm:
```bash
pnpm install @vueuse/core
```

**My Adjustment:**
ใช้ pnpm ติดตั้งสำเร็จ:
- Package: @vueuse/core v14.3.0
- ใช้สำหรับ provideSSRWidth และ Vue utilities อื่นๆ

---

## เริ่ม Implement

ต่อไปจะเริ่ม implement Required Features (30 คะแนน):
1. ✅ Login + Protected Routes (5 คะแนน)
2. ✅ Upload File (PDF, TXT) (5 คะแนน)
3. ✅ Chat with AI (basic) (5 คะแนน)
4. ✅ Chat with Uploaded File Context (10 คะแนน)
5. ✅ Token Usage Counter (5 คะแนน)

**Dependencies ที่ติดตั้งแล้ว:**
- @vueuse/core v14.3.0

**Next Steps:**
1. Install remaining dependencies (better-sqlite3, bcrypt, pdf-parse, etc.)
2. Setup configuration files (.env, nuxt.config.ts)
3. Implement Feature 1: Login + Protected Routes
