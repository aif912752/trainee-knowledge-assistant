# User Stories - Mini Knowledge Assistant

## Overview
Mini Knowledge Assistant เป็น web application ที่อนุญาตให้ผู้ใช้:
1. Login เข้าสู่ระบบ
2. Upload เอกสาร (PDF/TXT)
3. คุยกับ AI เกี่ยวกับเอกสารที่อัปโหลด
4. ดูการใช้งาน token

---

## User Story 1: Login

**As a** user
**I want to** login to the system
**So that** I can access my documents and chat with AI

### Acceptance Criteria
- [ ] User สามารถ login ด้วย username และ password
- [ ] System แสดง error message ถ้า credentials ผิด
- [ ] User ที่ login แล้วสามารถเข้าถึง protected pages ได้
- [ ] User ที่ไม่ได้ login จะถูก redirect ไปหน้า login
- [ ] Password ถูกเก็บแบบ hashed (ไม่ใช่ plain text)

### Mock User
- Username: `admin`
- Password: `admin123`

---

## User Story 2: Upload Document

**As a** user
**I want to** upload my documents (PDF or TXT)
**So that** I can ask AI questions about them

### Acceptance Criteria
- [ ] User สามารถเลือกไฟล์ PDF หรือ TXT จากเครื่อง
- [ ] System ตรวจสอบว่าไฟล์เป็น PDF หรือ TXT เท่านั้น
- [ ] System ปฏิเสธไฟล์ที่มีขนาดเกิน 5MB
- [ ] System แสดง error message ที่ชัดเจน ถ้าไฟล์ไม่ถูกต้อง
- [ ] เมื่อ upload สำเร็จ system แสดงชื่อไฟล์และขนาด
- [ ] System ดึงเนื้อหาจาก PDF/TXT เพื่อใช้ในการคุย

### Edge Cases
- ไฟล์ที่ไม่ใช่ PDF/TXT (เช่น .jpg, .docx)
- ไฟล์ที่มีขนาดเกิน 5MB
- ไฟล์ PDF ที่เสียหาย
- ไฟล์ที่มีชื่อภาษาไทยหรือพิเศษ

---

## User Story 3: Chat with AI

**As a** user
**I want to** chat with AI
**So that** I can get answers to my questions

### Acceptance Criteria
- [ ] User สามารถพิมพ์ข้อความและส่งไปหา AI
- [ ] AI ตอบกลับภายใน 30 วินาที
- [ ] System แสดง error message ถ้า AI ไม่ตอบ
- [ ] User สามารถดูประวัติการคุยได้
- [ ] System แสดงจำนวน token ที่ใช้ในแต่ละข้อความ

### Edge Cases
- AI API ล้มเหลว
- AI API ตอบช้ากว่า 30 วินาที
- User พิมพ์ข้อความว่างเปล่า
- User พิมพ์ข้อความยาวมาก

---

## User Story 4: Chat with Document Context

**As a** user
**I want to** chat with AI about my uploaded document
**So that** I can ask questions specific to my document

### Acceptance Criteria
- [ ] User สามารถเลือก document ที่อัปโหลดไว้
- [ ] AI ตอบคำถามโดยอ้างอิงจากเนื้อหาใน document
- [ ] AI ตอบได้ถูกต้องเกี่ยวกับข้อมูลใน document
- [ ] System แสดงว่ากำลังใช้ document ไหนอยู่
- [ ] User สามารถเปลี่ยน document ที่จะคุยด้วยได้

### Example Usage
**User uploads:** `contract.pdf` (สัญญาจ้าง)
**User asks:** "ในสัญญากำหนดเงินเดือนเท่าไหร่?"
**AI answers:** "ตามสัญญาหน้า 3 ข้อ 4.1 เงินเดือนคือ 30,000 บาทต่อเดือน"

### Edge Cases
- Document มีเนื้อหามาก (เกิน 10,000 tokens)
- Document อยู่ในรูปแบบที่อ่านยาก (ภาพ, table)
- User ถามคำถามที่ไม่เกี่ยวกับ document
- Document ไม่มีคำตอบ

---

## User Story 5: View Token Usage

**As a** user
**I want to** see how many tokens I'm using
**So that** I can track my API usage

### Acceptance Criteria
- [ ] System แสดงจำนวน token ที่ใช้ในแต่ละข้อความ
- [ ] System แสดง input tokens และ output tokens แยกกัน
- [ ] System แสดง total tokens ต่อ session
- [ ] User สามารถดูประวัติการใช้ token ได้
- [ ] System บันทึกการใช้ token ลง database

### Token Display
```
Message: "Hello, how are you?"
Input tokens: 8
Output tokens: 15
Total tokens: 23

Session Total: 1,234 tokens
```

---

## User Story 6: Session Management

**As a** user
**I want to** stay logged in during my session
**So that** I don't have to login repeatedly

### Acceptance Criteria
- [ ] User คงสถานะ login ไว้ตราบใดที่ browser ยังเปิด
- [ ] User ถูก logout เมื่อปิด browser (optional)
- [ ] System แสดงว่าใครกำลัง login อยู่
- [ ] User สามารถ logout ได้ด้วยตัวเอง

---

## Non-Functional Requirements

### Performance
- [ ] Page load time < 2 วินาที
- [ ] AI response time < 30 วินาที
- [ ] File upload < 10 วินาที (สำหรับไฟล์ 5MB)

### Security
- [ ] Passwords hashed with bcrypt
- [ ] Session stored in httpOnly cookie
- [ ] SQL injection prevention
- [ ] File type validation
- [ ] Input sanitization

### Usability
- [ ] UI เป็นภาษาไทยหรืออังกฤษ (ชัดเจน)
- [ ] Error messages เข้าใจง่าย
- [ ] Mobile responsive

### Reliability
- [ ] ไม่มี data loss เมื่อ upload
- [ ] ไม่ crash เมื่อ AI API ล้ม
- [ ] Database backup ทุกวัน (optional)

---

## User Flow

### Primary Flow
1. User เปิด website → ถูก redirect ไปหน้า login
2. User login ด้วย admin/admin123 → ถูก redirect ไปหน้า chat
3. User ไปที่หน้า upload → Upload PDF document
4. User กลับมาหน้า chat → เลือก document ที่อัปโหลด
5. User พิมพ์คำถามเกี่ยวกับ document → AI ตอบ
6. User ดู token usage ที่แสดงด้านบน
7. User พอใจ → logout หรือปิด browser

### Secondary Flow
1. User login → ไปหน้า chat เลย
2. User พิมพ์คำถามทั่วไป → AI ตอบโดยไม่มี document context
3. User ดู token usage

---

## Persona

### Primary User: นักศึกษา/นักพัฒนา
- อายุ 20-30 ปี
- คุ้นเคยกับ technology
- ต้องการทำความเข้าใจเอกสารเร็ว ๆ
- ใช้ทั้งภาษาไทยและอังกฤษ

### Goals
- เข้าใจเอกสารเร็วขึ้น
- สามารถถามคำถามเฉพาะกับเอกสาร
- ไม่ต้องอ่านเอกสารทั้งหมดเอง

### Pain Points
- เอกสารยาวและน่าเบื่อ
- ไม่รู้ว่าค้นหาอะไรจากเอกสาร
- ใช้เวลานานในการอ่าน
