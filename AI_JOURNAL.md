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

## Session 2-4: Tech Stack Decisions

**Prompts:**
> Part 1 มีคำแนะนำในการเลือก Tech Stack ที่ง่ายและรวดเร็วไหม
> อยากใช้ Nuxt.js และในส่วนตัวแชทคิดว่าจะใช้ n8n หรือจะใช้ api ในตัว nuxt แทนดี...
> งั้นใช้ Nuxt API Routes
> - SQLite
> สำหรับ API Claude ความเสี่ยงมันมีอยู่ในทุกระบบแหละ แม้แต่ Official เองก็เคยมีประวัติข้อมูลหลุด แต่สำหรับ z.ai มันคือเครื่องมือที่สมดุลที่สุดระหว่างความปลอดภัยที่ยอมรับได้ กับ ต้นทุนที่คุ้มค่า ในการพัฒนาโปรเจกต์ตอนนี้ และ z.ai  เป็นแพลตฟอร์มที่ค่อนข้างเป็นที่รู้จักในหมู่ Developer โดยเฉพาะในฝั่งที่ต้องการเข้าถึง Model หลากหลายค่าย ในราคาที่ถูกลงและชำระเงินง่าย ส่วน shadcn-vue / shadcn-nuxt: ตอนนี้มี Official Port สำหรับ Vue และ Nuxt โดยเฉพาะ ใช้งานได้เหมือนฝั่ง React โดยใช้ nuxi module add shadcn-nuxt

**AI Responses:**
สรุปการตัดสินใจ:
- Backend: Nuxt API Routes (ไม่ใช่ n8n)
- Database: SQLite (code quality +5 คะแนน)
- AI: z.ai (ถูก, ชำระง่ายในไทย)
- UI: shadcn-nuxt (official port พร้อมใช้)

**My Adjustment:**
ยืนยัน Tech Stack:
- Nuxt 3 + TypeScript + Tailwind
- Nuxt Server Routes
- SQLite (better-sqlite3)
- z.ai API
- shadcn-nuxt
- Docker Compose

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

## Tech Stack สรุป

```
Frontend:    Nuxt 3 + TypeScript + Tailwind CSS
Backend:     Nuxt Server Routes (built-in)
Database:    SQLite (better-sqlite3)
Vector DB:   (skip RAG ก่อน)
AI API:      z.ai (Claude API proxy)
UI:          shadcn-nuxt
Deploy:      Docker Compose
```

---

## เริ่ม Implement

ต่อไปจะเริ่ม implement Required Features (30 คะแนน):
1. ✅ Login + Protected Routes (5 คะแนน)
2. ✅ Upload File (PDF, TXT) (5 คะแนน)
3. ✅ Chat with AI (basic) (5 คะแนน)
4. ✅ Chat with Uploaded File Context (10 คะแนน)
5. ✅ Token Usage Counter (5 คะแนน)
