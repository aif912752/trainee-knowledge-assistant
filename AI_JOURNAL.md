# AI Usage Journal

## Session 1: Planning Assessment Strategy
**Prompt:** "ถ้าจะทำข้อแรกก่อน นายว่าดีไหม"
**AI Response:** 
- แนะนำให้เริ่มที่ Part 1 (Coding) ก่อน
- เหตุผล: คะแนนสูง (65 คะแนน), ใช้เวลาเยอะ, และเป็นรากฐานของส่วนอื่น
**My Adjustment:** ตัดสินใจทำ Part 1 ก่อนตามคำแนะนำ

## Session 2: Initial Tech Stack Research
**Prompt:** "Part 1 มีคำแนะนำในการเลือก Tech Stack ที่ง่ายและรวดเร็วไหม"
**AI Response:** 
- แนะนำ Next.js 14, SQLite, Claude API, และ shadcn/ui
- เปรียบเทียบ JSON vs SQLite: SQLite ดีกว่าในเรื่อง Type safety และ Concurrency
**My Adjustment:** เลือกใช้ Nuxt.js แทน Next.js และตัดสินใจใช้ SQLite

## Session 3: Nuxt-Specific Tech Stack Decisions
**Prompt:** "อยากใช้ Nuxt.js และในส่วนตัวแชทคิดว่าจะใช้ n8n หรือจะใช้ api ในตัว nuxt แทนดี แบบไหนง่ายกว่า? ส่วน Database: JSON file vs SQLite ขอความต่างและข้อจำกัด และจะใช้ Claude API (https://api.z.ai/api/anthropic) กับ shadcn/ui"
**AI Response:** 
- แนะนำ **Nuxt API Routes** แทน n8n เพราะเร็วกว่าและไม่ Overkill
- เปรียบเทียบ **SQLite** (Structured, SQL) vs **JSON** (Simple, no types)
- แนะนำ **shadcn-nuxt** แทน shadcn/ui (React)
- เตือนเรื่องความเสี่ยงของ **z.ai proxy** (Data privacy)
**My Adjustment:** 
- เลือก Nuxt API และ SQLite เพื่อคะแนน Code Quality
- ยืนยันใช้ z.ai เพราะราคาถูกและจ่ายเงินง่ายในไทย
- ติดตั้ง `shadcn-nuxt` module แทนการใช้ React version

## Session 4: Final Tech Stack Confirmation
**Prompt:** "งั้นใช้ Nuxt API Routes + SQLite สำหรับ API Claude ความเสี่ยงมันมีอยู่ในทุกระบบแหละ แม้แต่ Official เองก็เคยมีประวัติข้อมูลหลุด แต่สำหรับ z.ai มันคือเครื่องมือที่สมดุลที่สุดระหว่าง ความปลอดภัยที่ยอมรับได้ กับ ต้นทุนที่คุ้มค่า ในการพัฒนาโปรเจกต์ตอนนี้ และ z.ai เป็นแพลตฟอร์มที่ค่อนข้างเป็นที่รู้จักในหมู่ Developer โดยเฉพาะในฝั่งที่ต้องการเข้าถึง Model หลากลายค่าย ในราคาที่ถูกลงและชำระเงินง่าย ส่วน shadcn-vue / shadcn-nuxt: ตอนนี้มี Official Port สำหรับ Vue และ Nuxt โดยเฉพาะ ใช้งานได้เหมือนฝั่ง React โดยใช้ nuxi module add shadcn-nuxt"
**AI Response:** 
- ยอมรับการตัดสินใจใช้ z.ai และ shadcn-nuxt
- ให้โครงสร้างโปรเจกต์เบื้องต้นและคำสั่งติดตั้ง
**My Adjustment:** ยืนยัน Stack สุดท้าย: Nuxt API, SQLite, z.ai, และ shadcn-nuxt

## Session 5: Creating Nuxt Project
**Prompt:** "Create Nuxt project with pnpm เลือก template อะไร แต่เราจะใช้ shadcn-nuxt"
**AI Response:** แนะนำ `minimal` template เพื่อป้องกันความขัดแย้งกับ UI libraries อื่น
**My Adjustment:** สร้างโปรเจกต์ด้วย `minimal` template

## Session 6: Setting Up Documentation Files
**Prompt:** "Create Nuxt project ด้วย pnpm ยังไม่เสร็จ และขอให้สร้างไฟล์ .md สำหรับให้ Agent อ่าน"
**AI Response:** ช่วยร่างไฟล์เอกสารบังคับ (Agent.md, TODO.md, README.md, ฯลฯ)
**My Adjustment:** สร้างไฟล์เอกสารทั้งหมดไว้ใน Root และโฟลเดอร์ `doc/`

## Session 7: Updating Agent.md
**Prompt:** "แล้วไฟล์ Agent.md แก้ไขที ไม่ต้องบอกว่ากำลังทำข้อสอบ แต่อยากจะบอกลายละเอียดงานที่ต้องทำแทน"
**AI Response:** ปรับปรุง Agent.md ให้เน้นที่ Project Requirements และเกณฑ์การรับงาน
**My Adjustment:** อัปเดต Agent.md ให้มีความเป็นมืออาชีพ ตัดบริบทเรื่องข้อสอบออก

## Session 8: Uploading to GitHub
**Prompt:** "งั้นอัพไป git ก่อน โดยสร้าง repo โดยใช้ gh"
**AI Response:** สอนขั้นตอนการทำ `git init`, `commit` และใช้ GitHub CLI (`gh`) สร้าง repo
**My Adjustment:** ดันโปรเจกต์ขึ้น GitHub สำเร็จ (https://github.com/aif912752/trainee-knowledge-assistant)

## Session 9: Cloning to New Location
**Prompt:** "เรา clone project มาแล้วที่ \"D:\\Github\\trainee-knowledge-assistant\" ช่วยไปยังโฟลเดอร์นั้นแทนที พร้อมบันทึก AI_JOURNAL ตลอดทุกครั้งที่ prompt"
**AI Response:** ยืนยันการย้าย Directory ทำงานและรับปากบันทึก Log ทุก Prompt
**My Adjustment:** ย้ายมาทำงานที่ Directory ใหม่ถาวร

## Session 10: Installing Dependencies
**Prompt:** "เราได้เริ่ม Install dependencies ไปบ้างแล้ว และในส่วน import { provideSSRWidth } from '@vueuse/core' ช่วยติดตั้ง vueuse/core ให้ที"
**AI Response:** ให้คำสั่งติดตั้ง `@vueuse/core` (ต้องมี @)
**My Adjustment:** ติดตั้ง `@vueuse/core` v14.3.0 สำเร็จ

## Session 11: Installing Remaining Dependencies
**Prompt:** "พร้อมเริ่ม implement ต่อ ทีละส่วน"
**AI Response:** แนะนำ dependencies หลัก: `better-sqlite3`, `bcrypt`, และ `pdf-parse` พร้อม Types
**My Adjustment:** ติดตั้ง dependencies สำหรับ Database, Security และ PDF extraction ครบถ้วน

## Session 12: Setup Configuration Files
**Prompt:** "commit ก่อน"
**AI Response:** แนะนำขั้นตอนการ Commit แบบแยกกลุ่ม (Atomic Commits)
**My Adjustment:** เริ่มใช้การ Commit แยกส่วนเพื่อประวัติ Git ที่ดี

## Session 13: Configuration Files & Git Workflow
**Prompt:** "commit ไปเหลือ\nช่วย commit ไปกลุ่มๆไปด้วย อย่า commit ทีเดียว\nหากมีการพูด prompt บันทึกด้วย ทุกครั้ง"
**AI Response:** 
- อธิบายข้อดีของการ Commit แยกกลุ่ม (Rollback ง่าย, Review ง่าย)
- ช่วยตั้งค่า `.env`, `nuxt.config.ts` และ `.gitignore`
**My Adjustment:** ตั้งค่าโปรเจกต์พื้นฐานเสร็จสิ้นและปรับ Workflow การ Commit

## Session 14: Initialize Database Schema
**Prompt:** "เช็คใน TODO.md ด้วย ทำทีละขั้น อย่าทำทีเดียว"
**AI Response:** 
- ออกแบบ SQL Schema (4 tables: users, documents, messages, token_usage)
- สร้าง scripts สำหรับ Initialize และ Seed ข้อมูล
- สร้าง Repository Layer (CRUD logic)
**My Adjustment:** สร้างโครงสร้าง Database และ Repository แยกส่วนกันตามลำดับ

## Session 15: Auth Service & Login Implementation
**Prompt:** "พร้อมเริ่ม implement ต่อ ทีละส่วน"
**AI Response:** ออกแบบ `AuthService` สำหรับการ Hash รหัสผ่าน และการตรวจสอบผู้ใช้
**My Adjustment:** สร้าง `AuthService` เพื่อใช้เป็น Logic กลางของระบบสมาชิก

## Session 16: Centralized Types Directory & Better-sqlite3 Decision
**Prompt:** "ในโปรเจ็กได้ใช้ Prisma และ Type Safety ด้วยไหม"
**AI Response:** ชี้แจงว่าใช้ `better-sqlite3` (Raw SQL) และแนะนำให้สร้างโฟลเดอร์ `types/` แยก
**My Adjustment:** ตัดสินใจไม่ใช้ Prisma เพื่อความเบา แต่จะทำ Type Safety เองผ่าน shared types

## Session 17: Refactor to Centralized Types
**Prompt:** "ใช้ better-sqlite3 ต่อไป แต่ควรสร้างโฟลเดอร์ชื่อ types/ ไว้ที่ Root ของโปรเจกต์ เพื่อเก็บ Interface เหล่านี้แยกออกมา เพื่อให้ทั้ง Frontend และ Backend มองเห็น Type เดียวกันโดยไม่ต้อง import ซ้ำซ้อน และ ตั้งค่าใน nuxt.config.ts ให้มัน Auto-import โฟลเดอร์ types ได้"
**AI Response:** ช่วยสร้าง `types/` directory และ Refactor ทุก Repository ให้ใช้ shared types
**My Adjustment:** ปรับโครงสร้างโปรเจกต์ให้เป็น Full-stack Type Safety ผ่าน auto-import types

## Session 18: TypeScript Configuration Issues
**Prompt:** "ERROR Cannot find module 'vue-tsc/package.json'"
**AI Response:** แนะนำให้ติดตั้ง `vue-tsc` เพื่อใช้ในการตรวจ Type
**My Adjustment:** ติดตั้ง `vue-tsc` v3.2.8 เพื่อแก้ปัญหา Build error

## Session 19: TypeScript Path Resolution Errors
**Prompt:** "[vue-tsc] Cannot find module '~/types/document' or its corresponding type declarations.\nเหมือนเดิม (ยัง error เหมือนเดิม)"
**AI Response:** แนะนำให้ปิด `typeCheck` ใน Nuxt config ชั่วคราว และใช้ `imports.dirs` แทนเนื่องจาก Nuxt 4 conflict
**My Adjustment:** แก้ไขปัญหาการหา Type ไม่เจอเพื่อให้พัฒนาต่อได้

## Session 21: Adding Error Handling, Zod Validation, and Nuxt-Security
**Prompt:** "ควรมี ระบบจัดการ Error กลาง และ ติดตั้ง zod มาช่วยเช็ค Input และใช้ nuxt-security ด้วยจะดีกว่าไหม"
**AI Response:** 
- เห็นด้วยอย่างยิ่งเรื่องการทำ Centralized Error Handling
- แนะนำ `zod` สำหรับ Input validation
- แนะนำ `nuxt-security` เพื่อตั้งค่า Security Headers
**My Adjustment:** รวมระบบ Error, Validation และ Security เข้าไปในโปรเจกต์ (Code Quality +5)

## Session 22: Validation Architecture Discussion - Shared Frontend/Backend
**Prompt:** "ส่วนที่ทำ validation สามารถใช้ร่วมกับ frontend ได้ไหม"
**AI Response:** ยืนยันว่า Zod schemas สามารถแชร์ไปใช้ validate ฝั่ง Client-side form ได้
**My Adjustment:** วางแผนทำ Shared Validations เพื่อความสม่ำเสมอของข้อมูล

## Session 23: Shared Validations Location Discussion
**Prompt:** "แล้วถ้าสร้าง validations shared แทนล่ะ"
**AI Response:** แนะนำให้ใช้โฟลเดอร์ `utils/validations/` ตามมาตรฐาน Nuxt
**My Adjustment:** เตรียมย้ายไฟล์ Validation ไปยังตำแหน่งที่เหมาะสม

## Session 24: Validation File Structure Decision
**Prompt:** "Validation ควรแยกเป็นไฟล์แต่ละส่วนไหม หรือรวมไว้ในไฟล์เดียว ลองคำนึงถึงความเหมาะสมที"
**AI Response:** แนะนำให้แยกตาม Feature (auth, document, chat) เพื่อป้องกันไฟล์ใหญ่เกินไป
**My Adjustment:** ตัดสินใจแยกไฟล์ Validation เพื่อการดูแลรักษาที่ง่าย

## Session 25: Nuxt Directory Structure for Validations
**Prompt:** "ถ้าออยากมาสร้าง โฟลเดอร์ validation แยกเลยจะดีกว่าไหม ตามหลัก Nuxt Directory Structure ควรเป็นแบบไหน"
**AI Response:** สรุปว่า `utils/validations/` ดีที่สุดเพราะรองรับ Auto-import และแชร์ระหว่างชั้นได้
**My Adjustment:** เลือกโครงสร้าง `utils/validations/` ตามคำแนะนำ

## Session 26: Migrating Validations to utils/validations/
**Prompt:** "เริ่มย้ายตาม Option 1"
**AI Response:** ช่วยย้าย Zod schemas และสร้าง Helper functions สำหรับการ Validate
**My Adjustment:** Refactor ระบบ Validation เสร็จสมบูรณ์

## Session 27: Implementing Login API Endpoint and Protected Route Middleware
**Prompt:** "ต่อไปทำ Login + Protected Routes ต่อ พร้อม unit test"
**AI Response:** 
- สร้าง Session Utility โดยใช้ httpOnly cookies (ปลอดภัยกว่า LocalStorage)
- สร้าง Login API endpoint
- สร้าง Middleware สำหรับป้องกัน Route ที่ต้อง Login
**My Adjustment:** วางระบบ Authentication ที่ปลอดภัยด้วย httpOnly cookies และ Middleware

---

## Session 28: Fixing Nuxt 4 Directory Structure and Import Path Issues
**Prompts:** 
- "[20:03:20] WARN Duplicated import \"clearSession\", the one from \"h3\" has been ignored"
- "ไม่ควรใช้ any ด้วย"
- "[nitro 20:17:54] ERROR Error: Could not load D:/Github/trainee-knowledge-assistant/app//utils/validations"
- "ตามหลัก Nuxtควรเป็นแบบนี้ [Nuxt 4 directory structure]"
- "[nitro 20:25:52] ERROR Error: Could not load D:/Github/trainee-knowledge-assistant/app//shared/validations"
- "WARN Component directory does not exist: D:/Github/trainee-knowledge-assistant/components/ui"
- "บันทึก prompt ลง AI_JOURNAL ด้วย"
**AI Response:** 
- แก้ปัญหา Naming conflict ของ `clearSession` กับ h3 โดยเปลี่ยนเป็น `clearUserSession`
- เปลี่ยนการใช้ `any` เป็น `H3Event` เพื่อ Type safety
- ปรับโครงสร้างโปรเจกต์ตาม Nuxt 4 (ย้าย `utils/validations/` ไปที่ `shared/validations/`)
- ตั้งค่า `srcDir: '.'` ใน `nuxt.config.ts` เพื่อให้ Alias `~` ชี้ไปที่ Project root
- แก้ไขปัญหา Path resolution และตั้งค่า Component directory สำหรับ shadcn-nuxt
**My Adjustment:** 
- Rename ฟังก์ชันเพื่อเลี่ยงข้อผิดพลาด Naming conflict
- ปรับโครงสร้าง Directory ให้ตรงตามมาตรฐาน Nuxt 4
- ปรับปรุง Type safety โดยใช้ `H3Event` แทน `any`
- Commit แยกส่วนเพื่อประวัติ Git ที่ดี

## Session 29: Fixing Shadcn Component Installation Path
**Prompt:** "มันควรอยู่ใน app/components/ui นะ แล้วตอนติดตั้งทำไมมันยุข้างนอกได้"
**AI Response:** 
- สาเหตุเกิดจาก `components.json` ตั้ง Alias ไว้ที่ `@/components` ซึ่งใน Nuxt 4 จะชี้ไปที่ Root นอกโฟลเดอร์ `app/`
- ต้องย้ายคอมโพเนนต์ไปที่ `app/components/ui/` ให้ถูกต้อง
- แก้ไข `components.json` และ `nuxt.config.ts` ให้ชี้ไปที่โฟลเดอร์ `app/` เพื่อให้การติดตั้งครั้งต่อไปถูกต้อง
**My Adjustment:** 
- ย้ายไฟล์คอมโพเนนต์ทั้งหมด (sonner, input, ฯลฯ) เข้าไปใน `app/components/ui/`
- อัปเดต `components.json` ให้ใช้ `@/app/` เป็นฐานสำหรับ Aliases
- อัปเดต `nuxt.config.ts` ตั้งค่า `componentDir: "./app/components/ui"`
- ตรวจสอบความถูกต้องของ Directory structure เพื่อแก้ปัญหา ENOENT

## Session 29: Implementing Login Page with vee-validate and shadcn Components
**Prompts:**
- "เช็ค TODO.md ทีว่าควรทำไรต่อ"
- "Implement login API endpoint ให้ที"
- "ควรใช้ component shadcn"
- "ติดตั้งไว้แล้ว" (repeated 2 times)
- "Use the useForm composable from vee-validate or use <Form /> component to create a form."
- "อัพเดท AI_JOURNAL.md"
**AI Response:**
- ตรวจสอบและยืนยันว่า Login API endpoint พร้อมใช้งานแล้ว
- ตรวจสอบ shadcn components ที่มีอยู่ (Card, Input, Label, Button, etc.)
- สร้าง Login page (`pages/login.vue`) โดยใช้:
  - vee-validate's `useForm` composable
  - Zod validation schema (`loginSchema`)
  - shadcn components (Card, Input, Label, Button)
  - Form validation พร้อม error messages
  - Loading states
- สร้าง Auth check API (`server/api/auth/me.get.ts`) เพื่อตรวจสอบ session
- สร้าง Protected route middleware (`middleware/auth.ts`) เพื่อป้องกัน routes
- สร้าง Index page (`pages/index.vue`) พร้อม authentication check
- อัปเดต TODO.md ให้สอดคล้องกับความคืบหน้า
**My Adjustment:**
- สร้างหน้า Login ที่สมบูรณ์ด้วย vee-validate + shadcn-nuxt
- วางระบบ Authentication ครบถ้วน (API, Middleware, Pages)
- เตรียมพร้อมสำหรับการทดสอบระบบ Login

## Session 30: Fixing CSS Loading and Nuxt 4 Structure Alignment
**Prompt:** "เหมือน css จะไม่เข้านะ ดูจากหน้า login ทั้งๆที่มีการตั้งค่าธีมสีไว้แล้ว แต่ไม่มีสีไรเลย"
**AI Response:** 
- ปัญหาเกิดจาก `app.vue` ยังเป็นค่าเริ่มต้น (`<NuxtWelcome />`) และไม่ได้โหลดไฟล์ CSS
- โครงสร้างโปรเจกต์ยังไม่เป็น Nuxt 4 เต็มรูปแบบ (pages และ middleware อยู่นอกโฟลเดอร์ `app/`)
- ต้องเพิ่มไฟล์ CSS เข้าไปใน `nuxt.config.ts` และอัปเดต `app.vue` ให้ใช้ `<NuxtPage />`
**My Adjustment:** 
- ย้าย `pages/` และ `middleware/` เข้าไปอยู่ใน `app/` เพื่อให้เป็น Nuxt 4 structure ที่ถูกต้อง
- ลบ `srcDir: '.'` ออกจาก `nuxt.config.ts` เพื่อใช้ค่าเริ่มต้นของ Nuxt 4 (ซึ่งจะมอง `app/` เป็นหลัก)
- เพิ่ม `css: ['~/assets/css/tailwind.css']` ใน `nuxt.config.ts`
- อัปเดต `app/app.vue` ให้รองรับ Routing (`<NuxtPage />`) และติดตั้ง `<Toaster />` สำหรับการแจ้งเตือน
- ปรับปรุง Import paths ให้ใช้ Alias `~/` ที่ชี้ไปยังโฟลเดอร์ `app/` โดยตรง

## Session 31: Fixing Nitro Import Path Resolution for Nuxt 4
**Prompt:** "[nitro 21:51:17] ERROR Error: Could not load .../app//shared/validations"
**AI Response:** 
- ใน Nuxt 4 โฟลเดอร์ `shared`, `types`, และ `server` อยู่ที่ Root นอก `app/` ทำให้ Alias `~/` เริ่มต้นชี้ไปผิดที่
- ต้องตั้งค่า `alias` ใน `nuxt.config.ts` โดยใช้ **Absolute Path** (ผ่าน `fileURLToPath`)
**My Adjustment:** 
- เพิ่ม `import { fileURLToPath } from 'node:url'` ใน `nuxt.config.ts`
- ตั้งค่า `alias` แบบ Absolute Path สำหรับ `~/types`, `~/shared`, และ `~/server`
- แก้ปัญหา ENOENT ใน Nitro สำเร็จ

## Session 32: Standardizing Root Aliases with ~~
**Prompt:** "ทำตามมาตรฐานของ nuxt"
**AI Response:** 
- ตามมาตรฐาน Nuxt 4: `~/` ชี้ไปที่ `srcDir` (โฟลเดอร์ `app/`), ส่วน `~~/` ชี้ไปที่ `rootDir` (Root ของโปรเจกต์)
- การใช้ `~/` กับโฟลเดอร์นอก `app/` (เช่น `server`, `shared`, `types`) ทำให้เกิดคำเตือน duplicated modules และปัญหา path resolution
- วิธีที่ถูกต้องและเป็นมาตรฐานที่สุดคือการใช้ `~~/` สำหรับโฟลเดอร์ที่อยู่ที่ Root
**My Adjustment:** 
- เปลี่ยนการเรียกใช้ Alias ทั้งหมดจาก `~/server/`, `~/shared/`, `~/types/` เป็น `~~/server/`, `~~/shared/`, `~~/types/`
- ลบการตั้งค่า Custom Alias ใน `nuxt.config.ts` ออกเพื่อใช้มาตรฐาน Built-in ของ Nuxt
- ปรับปรุง `imports.dirs` ให้ใช้ Absolute Path เพื่อความแม่นยำในการ Auto-import จาก Root
- แก้ไขปัญหา Warning ใน Nitro ได้อย่างถาวรและถูกต้องตามมาตรฐาน

## Session 33: Fixing CommonJS require error in ESM environment
**Prompt:** "require is not defined in ES module scope, you can use import instead"
**AI Response:** 
- โปรเจกต์ถูกตั้งค่าเป็น ES Module (`"type": "module"` ใน `package.json`) ทำให้ไม่สามารถใช้ `require()` ได้
- ต้องเปลี่ยนการเรียกใช้ `require('fs')` เป็นการใช้ `import` แบบมาตรฐาน
**My Adjustment:** 
- แก้ไขไฟล์ `server/db/init.ts` โดยการเพิ่ม `mkdirSync` เข้าไปในส่วนของ `import { ... } from 'fs'`
- เปลี่ยนการเรียก `require('fs').mkdirSync` เป็น `mkdirSync` โดยตรง
- ตรวจสอบไฟล์อื่นๆ ในโปรเจกต์เพื่อให้แน่ใจว่าไม่มีการใช้ `require()` หลงเหลืออยู่

## Session 34: Fixing Schema File Path Resolution in Nitro Dev
**Prompt:** "ENOENT: no such file or directory, open '.../.nuxt/dev/schema.sql'"
**AI Response:** 
- ปัญหานี้เกิดจากในโหมด Development ของ Nuxt/Nitro ตัวแปร `import.meta.url` จะชี้ไปยังโฟลเดอร์ build (`.nuxt/dev`) แทนที่จะเป็นโฟลเดอร์ source จริงๆ
- ทำให้ระบบหาไฟล์ `schema.sql` ไม่เจอเพราะมันไม่ได้ถูก copy ไปไว้ในโฟลเดอร์ build ด้วย
**My Adjustment:** 
- แก้ไข `server/db/init.ts` ให้ใช้ `process.cwd()` ในการหาตำแหน่งไฟล์ `schema.sql` เมื่อรันในโหมด development
- การใช้ `join(process.cwd(), 'server/db/schema.sql')` ช่วยให้ระบบอ้างอิงตำแหน่งไฟล์จาก Root ของโปรเจกต์ได้อย่างถูกต้องเสมอไม่ว่าจะรันจากที่ไหน
- เพิ่ม logic ตรวจสอบสภาพแวดล้อม (`process.env.NODE_ENV`) เพื่อให้ยังคงทำงานได้ถูกต้องทั้งในโหมด Dev และ Production

