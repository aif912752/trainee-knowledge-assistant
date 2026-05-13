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

## Decision 4: Centralized Validations (Zod) & Shared Types

### Context
ต้องการทำ Validation สำหรับข้อมูลจากผู้ใช้งาน (เช่น Auth, Document Upload) ทั้งในฝั่ง Frontend (Form) และ Backend (API) โดยไม่อยากเขียนโค้ดซ้ำซ้อน

### Alternatives Considered
1. **แยก Validation ขาดจากกัน** - เขียน Frontend ใช้ Rules ทั่วไป และ Backend เช็ค Manual (if/else)
2. **Shared Zod Schemas** - สร้าง Zod schema ไว้ตรงกลางแล้วเรียกใช้ทั้งสองฝั่ง

### Why Shared Zod
1. **Single Source of Truth** - แก้ไขกฎการตรวจสอบที่เดียว อัปเดตทั้งหน้าบ้านและหลังบ้าน ทำให้การทำงานสม่ำเสมอ
2. **Security** - ฝั่ง API ไม่จำเป็นต้องเชื่อใจข้อมูลจาก Client เสมอไป เพราะมี Schema ตรวจสอบซ้ำ
3. **Clean Code** - ลดความซ้ำซ้อน (DRY) โดยแยกโฟลเดอร์ `shared/validations/` ทำให้ Nuxt Auto-import ได้ง่าย และสามารถประยุกต์ใช้เป็น Type/Interface (ผ่าน `z.infer`) ได้เลย

---

## Decision 5: Switching from `pdf-parse` to `pdfjs-dist`

### Context
ฟีเจอร์ Upload Document ต้องดึงข้อความจากไฟล์ PDF ในช่วงแรกเลือกใช้ `pdf-parse` แต่พบปัญหาเมื่อทำงานในสภาพแวดล้อม Nuxt 4 (ESM)

### Alternatives Considered
1. **pdf-parse** - เป็นไลบรารีที่ใช้งานง่าย แต่เก่าและไม่รองรับ ESM ได้ดีนัก (พบปัญหา `AbortException` และ Missing Default Export)
2. **pdfjs-dist** - ไลบรารีมาตรฐานจาก Mozilla อัปเดตสม่ำเสมอ รองรับโครงสร้างสมัยใหม่

### Why `pdfjs-dist`
1. **ESM Compatibility** - แก้ปัญหา Import error และสามารถทำงานร่วมกับระบบ Module สมัยใหม่ของ Nuxt/Nitro ได้ดีกว่า
2. **Stability** - บังคับใช้ Legacy Build เพื่อเลี่ยงปัญหา Browser DOM (`DOMMatrix` error) ในฝั่ง Node.js Server ทำให้ระบบสามารถแกะข้อความภาษาไทยจาก PDF ได้อย่างเสถียร 100%

---

## Decision 6: AI Fallback Strategy & Centralized BaseApiService

### Context
ระบบ Chat ต้องเรียก API ของ AI Providers ซึ่งอาจมีอาการค้างหรือไม่เสถียร และพบว่าการเขียน Logic เชื่อมต่อ API ใน Service หลาย ๆ ตัวทำให้โค้ดซ้ำซ้อน

### Alternatives Considered
1. **ใช้ Provider เดียว (z.ai) และยิงตรงผ่าน `$fetch`** - ง่ายแต่เสี่ยงเรื่องระบบล่ม และดูแลโค้ดยากเมื่อต้องการขยายระบบ
2. **สร้าง Base API และระบบ Fallback** - หากตัวแรกพัง ให้สลับไปใช้อีกตัวอัตโนมัติ โดยรวมศูนย์ Logic ไว้ที่คลาสหลัก

### Why Fallback & BaseApiService
1. **High Availability** - สร้างระบบ Fallback ไปยัง OpenRouter (Gemini 2.0) หาก z.ai (Claude) ไม่ตอบสนอง (เช่น Timeout หรือ Error 5xx)
2. **Scalability & DRY** - สร้าง `BaseApiService` เป็นคลาสแม่ เพื่อจัดการเรื่อง `$fetch`, การทำ Timeout (30 วินาที), และ Centralized Error Mapping ทำให้การเพิ่ม AI Provider ใหม่ในอนาคตทำได้ทันที

---

## Decision 7: File Upload Storage & EXDEV Error Handling

### Context
เมื่อผู้ใช้อัปโหลดไฟล์จากหน้าบ้าน ระบบเจอปัญหา `EXDEV: cross-device link not permitted` เมื่อพยายามย้ายไฟล์ (rename) ข้าม Drive หรือ Partition

### Alternatives Considered
1. **ใช้ `fs.renameSync` ตามปกติ** - ไม่สามารถแก้ปัญหา Error บนระบบที่มีหลาย Partition (เช่น การอัปโหลดผ่าน Temp file ของ OS)
2. **Copy + Unlink** - คัดลอกข้อมูลไปที่เป้าหมายแล้วลบไฟล์ต้นฉบับทิ้ง

### Why Copy + Unlink & Local Storage
1. **Robustness** - แก้ปัญหา EXDEV ได้เด็ดขาด ทำให้การอัปโหลดไฟล์เสถียร ไม่ว่าจะรันใน Local (ย้ายข้าม Drive C: ไป D:) หรือบน Server
2. **Container-Ready** - ตัดสินใจเก็บเอกสารจริงไว้ในโฟลเดอร์ `storage/` ที่ Root Directory เพื่อให้ง่ายต่อการ Mount Volume หากต้องนำระบบไปรันบน Docker

---

## Decision 8: Choosing `markdown-it` and `highlight.js` for Chat UI

### Context
AI มักจะตอบกลับมาในรูปแบบ Markdown ซึ่งหากแสดงผลเป็นข้อความธรรมดา (Plain Text) จะทำให้อ่านยาก ไม่มีการแบ่งหัวข้อ (Headers) หรือตัวหนา (Bold) และ Code blocks จะไม่มีสีสัน

### Alternatives Considered
1. **แสดงผลแบบ Plain Text** - ใช้ `whitespace-pre-wrap`
   - ข้อดี: ง่ายที่สุด ไม่ต้องติดตั้งอะไรเพิ่ม
   - ข้อเสีย: ประสบการณ์ผู้ใช้แย่ อ่านข้อมูลที่ซับซ้อนยาก ไม่ได้คะแนนโบนัส

2. **vue-markdown-render** - Wrapper สำหรับ markdown-it ใน Vue
   - ข้อดี: ใช้ง่ายในรูปแบบ component
   - ข้อเสีย: มี dependency เพิ่มเติม และอาจไม่ยืดหยุ่นเท่าการเรียกใช้ library ตรงๆ

3. **markdown-it + highlight.js** - มาตรฐานอุตสาหกรรม
   - ข้อดี: เสถียรสูง, ปรับแต่งได้มาก (Plugins), รองรับ Syntax Highlighting ครบถ้วน, ได้คะแนนโบนัส (+3)
   - ข้อเสีย: ต้องเขียน CSS ปรับแต่งเอง (แต่ใช้ Tailwind ช่วยได้)

### Why `markdown-it` & `highlight.js`
1. **Industry Standard** - เป็นที่นิยมและมี ecosystem ใหญ่ที่สุด
2. **Performance** - เร็วและเบา (เมื่อเทียบกับ library อื่นที่ฟีเจอร์เท่ากัน)
3. **Customization** - สามารถเขียน CSS scoped เพื่อควบคุมหน้าตาของ Markdown ให้เข้ากับธีมของแอปได้ 100%
4. **Syntax Highlighting** - `highlight.js` รองรับภาษาโปรแกรมที่หลากหลายมาก เหมาะกับ Use case ที่ถามตอบเรื่อง Code

### Trade-offs
- ❌ **ต้องดูแล CSS เอง** - ต้องเขียนสไตล์สำหรับ `markdown-body` เองเพื่อให้เข้ากับ Tailwind CSS
- ✅ **สวยงามระดับ ChatGPT/Claude** - ทำให้แอปดูมีความเป็นมืออาชีพสูงขึ้นมาก

---

## Decision 9: Implementing Streaming Responses with SSE and `event.waitUntil`

### Context
การรอให้ AI ตอบจนเสร็จ (Non-streaming) อาจใช้เวลานาน (5-10 วินาที) ซึ่งทำให้ผู้ใช้รู้สึกว่าระบบค้าง การทำ Streaming ช่วยให้ผู้ใช้เห็นข้อความค่อยๆ ปรากฏขึ้นทันที ลด Perceived Latency ได้อย่างมาก

### Alternatives Considered
1. **Non-streaming (Current)** - รอรับ JSON ก้อนเดียว
   - ข้อดี: พัฒนาง่าย, จัดการ Database ง่าย
   - ข้อเสีย: UX ไม่ดีสำหรับข้อความยาวๆ

2. **WebSockets** - การเชื่อมต่อแบบสองทาง
   - ข้อดี: Real-time เต็มรูปแบบ
   - ข้อเสีย: Overkill สำหรับแอปแชททางเดียว, จัดการสถานะการเชื่อมต่อยากกว่าบน Serverless environment

3. **Server-Sent Events (SSE) / ReadableStream** - มาตรฐานการทำ Streaming
   - ข้อดี: น้ำหนักเบา, รองรับโดยเบราว์เซอร์สมัยใหม่, เหมาะกับ AI response
   - ข้อเสีย: ต้องจัดการการประมวลผลข้อมูลในขณะที่ยังโหลดไม่เสร็จ

### Why SSE & `event.waitUntil`
1. **Improved UX** - ผู้ใช้เห็นข้อความทันที (Chunk by chunk)
2. **Resource Efficiency** - ใช้ `ReadableStream` ของมาตรฐาน Web API ซึ่งประหยัด Memory กว่าการรอโหลดทั้งก้อน
3. **Background Processing** - ใช้ `event.waitUntil` (Nitro) เพื่อบันทึกข้อมูลลง Database หลังจากส่ง Stream ให้ผู้ใช้เสร็จแล้ว ทำให้ API ตอบสนองได้รวดเร็วที่สุด
4. **Resiliency** - พัฒนาระบบ Parsing แบบยืดหยุ่นที่รองรับทั้ง format ของ Anthropic (z.ai) และ OpenAI (OpenRouter)

### Trade-offs
- ❌ **Complexity** - โค้ดฝั่ง Frontend และ Backend ซับซ้อนขึ้นเนื่องจากต้องจัดการกับ Binary/Text streams และ Partial JSON parsing
- ❌ **Usage Tracking Accuracy** - การนับ Token ในขณะ Streaming ทำได้ยากกว่า (ใช้วิธีประมาณการหรืออัปเดตหลังจากจบ Stream)
- ✅ **ยอมรับได้** เพื่อแลกกับความพึงพอใจของผู้ใช้สูงสุด

---

## Summary

ทั้ง 9 decisions นี้แสดงแนวคิดในการพัฒนา:

1. **Pragmatic over Perfect** - เลือกเครื่องมือที่เหมาะกับ context ไม่ใช่ที่ดีที่สุดเสมอไป
2. **Leverage Existing Skills** - ใช้สิ่งที่คุ้นเคย (Vue, SQL) เพื่อลด learning curve
3. **Balance Quality vs Constraints** - ยอมรับ trade-offs บางอย่างเพื่อได้ประโยชน์ใหญ่ (คะแนน, เวลา, งบประมาณ)

ทั้งหมดนี้เป็น decisions ที่ผ่านการคิดอย่างรอบคอบ และเหมาะสมกับ context ของ Junior Dev Assessment 2026
