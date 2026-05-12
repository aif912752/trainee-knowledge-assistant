# Wireframes - Mini Knowledge Assistant

## Page Structure

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page / redirect to login or chat |
| Login | `/login` | Login form |
| Chat | `/chat` | Main chat interface |
| Upload | `/upload` | File upload interface |

---

## 1. Login Page (`/login`)

### Layout
```
┌─────────────────────────────────────┐
│                                     │
│         [Logo/Title]                │
│     Mini Knowledge Assistant        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Username                   │   │
│  │  [_____________________]     │   │
│  │                             │   │
│  │  Password                   │   │
│  │  [_____________________]     │   │
│  │                             │   │
│  │  [Login Button]             │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Demo: admin / admin123             │
│                                     │
└─────────────────────────────────────┘
```

### Components
- **Title:** "Mini Knowledge Assistant" (center, top)
- **Form:**
  - Username input (text)
  - Password input (password)
  - Login button (primary color)
- **Helper Text:** "Demo credentials: admin / admin123" (bottom, small)

### States
- **Default:** Show form
- **Loading:** Disable button, show "Loading..."
- **Error:** Show error message above form (red)
- **Success:** Redirect to `/chat`

---

## 2. Upload Page (`/upload`)

### Layout
```
┌─────────────────────────────────────┐
│  [Logo]  Mini Knowledge   [Logout]  │
├─────────────────────────────────────┤
│                                     │
│  Upload Document                    │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    📁                       │   │
│  │    Drag & Drop File Here    │   │
│  │    or                       │   │
│  │    [Choose File]            │   │
│  │                             │   │
│  │    Supported: PDF, TXT      │   │
│  │    Max size: 5MB            │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Upload Button]                    │
│                                     │
│  Your Documents:                    │
│  ┌─────────────────────────────┐   │
│  │ 📄 contract.pdf (2.3 MB)    │   │
│  │    Uploaded 2 hours ago     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📄 notes.txt (45 KB)        │   │
│  │    Uploaded 1 day ago       │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Components
- **Header:**
  - Logo/Title (left)
  - Logout button (right)
- **Upload Area:**
  - Drag & drop zone
  - "Choose File" button
  - Helper text: "Supported: PDF, TXT | Max size: 5MB"
- **Upload Button:** Primary color, below upload area
- **Documents List:**
  - Each document: icon, name, size, upload time
  - Click to select (highlight when selected)

### States
- **Default:** Show upload area + documents list
- **Dragging:** Highlight upload area (blue border)
- **File Selected:** Show filename, size
- **Uploading:** Show progress bar
- **Success:** Show success message, add to list
- **Error:** Show error message (file type, size, etc.)

---

## 3. Chat Page (`/chat`)

### Layout
```
┌─────────────────────────────────────┐
│  [Logo]  Mini Knowledge   [Logout]  │
├─────────────────────────────────────┤
│  Session Tokens: 1,234  📊          │
├─────────────────────────────────────┤
│  Document: [contract.pdf ▼]         │
├─────────────────────────────────────┤
│                                     │
│  Chat History                       │
│  ────────────────────────────────   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 User (10:30)             │   │
│  │ What is the salary in       │   │
│  │ this contract?              │   │
│  │                             │   │
│  │ 🤖 AI (10:30) 25 tokens     │   │
│  │ According to page 3,        │   │
│  │ section 4.1, the salary     │   │
│  │ is 30,000 THB per month.    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 👤 User (10:31)             │   │
│  │ When does it start?         │   │
│  │                             │   │
│  │ 🤖 AI (10:31) 18 tokens     │   │
│  │ The contract starts on      │   │
│  │ February 1, 2025.           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ────────────────────────────────   │
│                                     │
├─────────────────────────────────────┤
│  [_________________________] [Send] │
│                                     │
└─────────────────────────────────────┘
```

### Components
- **Header:**
  - Logo/Title (left)
  - Session token count (right)
- **Document Selector:**
  - Dropdown: "Select document..."
  - Shows currently selected document
  - Empty option = chat without document
- **Chat Area:**
  - Scrollable message list
  - User messages: right aligned, blue background
  - AI messages: left aligned, gray background
  - Each message shows:
    - Sender avatar (👤/🤖)
    - Timestamp
    - Content
    - Token count (AI messages only)
- **Input Area:**
  - Text input (auto-expand)
  - Send button

### States
- **Default:** Show chat history (empty if new session)
- **Streaming:** Show "..." indicator, reveal text gradually
- **Error:** Show error message in chat (red)
- **Document Selected:** Highlight document in dropdown
- **Typing:** Show "AI is typing..." indicator

---

## 4. Home Page (`/`)

### Layout
```
┌─────────────────────────────────────┐
│                                     │
│         [Logo/Title]                │
│     Mini Knowledge Assistant        │
│                                     │
│  Chat with AI about your documents │
│                                     │
│  [Go to Chat]  [Upload Document]   │
│                                     │
│  Features:                          │
│  ✅ Upload PDF/TXT files            │
│  ✅ Chat with AI                    │
│  ✅ Ask questions about docs        │
│  ✅ Track token usage               │
│                                     │
└─────────────────────────────────────┘
```

### Components
- **Title:** "Mini Knowledge Assistant"
- **Description:** "Chat with AI about your documents"
- **CTA Buttons:**
  - "Go to Chat" (primary)
  - "Upload Document" (secondary)
- **Features List:** Bullet points with icons

### States
- **Not Logged In:** Show login form or "Login to continue"
- **Logged In:** Show CTAs to chat/upload

---

## Responsive Design

### Mobile (< 768px)
- **Login:** Full-width form
- **Upload:** Stack vertically, remove drag & drop (show button only)
- **Chat:** Full-screen messages, input area fixed at bottom
- **Navigation:** Hamburger menu (optional)

### Tablet (768px - 1024px)
- **Login:** Center form, 80% width
- **Upload:** Two-column layout (upload area + list)
- **Chat:** Sidebar with document list (collapsible)

### Desktop (> 1024px)
- **Login:** Center form, fixed width (400px)
- **Upload:** Two-column layout, better spacing
- **Chat:** Three-column layout (docs list | chat | details)

---

## Color Scheme

### Primary Colors
- **Primary Blue:** #3B82F6 (buttons, links)
- **Success Green:** #10B981 (success messages)
- **Error Red:** #EF4444 (error messages)
- **Warning Yellow:** #F59E0B (warnings)

### Neutral Colors
- **Background:** #FFFFFF (white)
- **Surface:** #F3F4F6 (light gray)
- **Text:** #1F2937 (dark gray)
- **Text Secondary:** #6B7280 (medium gray)
- **Border:** #E5E7EB (light gray)

### Chat Colors
- **User Message:** #3B82F6 (blue)
- **AI Message:** #F3F4F6 (light gray)
- **System Message:** #FEF3C7 (yellow)

---

## Typography

### Font Families
- **Primary:** Inter, system-ui, sans-serif
- **Monospace:** Fira Code, monospace (for code snippets)

### Font Sizes
- **H1:** 24px (page titles)
- **H2:** 20px (section titles)
- **Body:** 16px (normal text)
- **Small:** 14px (helper text, timestamps)
- **XSmall:** 12px (metadata)

---

## Icons

| Icon | Usage | Source |
|------|-------|--------|
| 📁 | Upload | Emoji |
| 📄 | Document | Emoji |
| 👤 | User | Emoji |
| 🤖 | AI | Emoji |
| 📊 | Stats | Emoji |
| ✅ | Check | Emoji |
| ❌ | Error | Emoji |
| ⚠️ | Warning | Emoji |

---

## Component Library

### shadcn-nuxt Components
- `Button` (primary, secondary, ghost)
- `Input` (text, password, file)
- `Card` (message bubbles, upload area)
- `Dropdown` (document selector)
- `Toast` (notifications)
- `Badge` (token count, status)

### Custom Components
- `ChatBubble.vue` (user/AI messages)
- `DocumentCard.vue` (document list item)
- `TokenCounter.vue` (token display)
- `UploadZone.vue` (drag & drop area)

---

## Interactions

### Hover Effects
- Buttons: Darken background
- Cards: Slight shadow increase
- Links: Underline

### Active States
- Buttons: Scale down (0.98)
- Inputs: Blue border

### Transitions
- Page fade: 300ms
- Message slide: 200ms
- Modal fade: 200ms

---

## Accessibility

### Keyboard Navigation
- `Tab`: Navigate between inputs
- `Enter`: Submit forms
- `Escape`: Close modals
- `Ctrl+Enter`: Send message

### Screen Readers
- ARIA labels on all inputs
- Alt text for icons
- Live regions for chat updates

### Focus Indicators
- Blue outline on focused elements
- Visible focus state

---

## Animation

### Page Load
- Fade in from top (300ms)

### Message Send
- Slide in from right (200ms)

### Upload Progress
- Progress bar fill (duration varies)

### Typing Indicator
- Three dots bouncing (infinite loop)

---

## Notes

- **Mobile First:** Design for mobile, scale up for desktop
- **Performance:** Lazy load chat history, infinite scroll
- **Offline:** Show cached messages if offline (optional)
- **Dark Mode:** Consider adding (bonus feature)
