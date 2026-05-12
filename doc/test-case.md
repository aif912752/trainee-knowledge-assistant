# Test Cases - Mini Knowledge Assistant

## Test Strategy

### Testing Levels
1. **Unit Tests** — Test individual functions/services
2. **Integration Tests** — Test API endpoints
3. **E2E Tests** — Test user flows (optional)
4. **Manual Tests** — Test by hand

### Coverage Target
- Minimum: 40% (for bonus +5 คะแนน)
- Ideal: 60%+

---

## 1. Login Feature Tests

### Unit Tests

#### Test: Password Hashing
```typescript
describe('AuthService.hashPassword', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'admin123'
    const hash = await hashPassword(password)

    expect(hash).not.toBe(password)
    expect(hash).toHaveLength(60) // bcrypt hash length
  })

  it('should generate different hashes for same password', async () => {
    const password = 'admin123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    expect(hash1).not.toBe(hash2)
  })
})
```

#### Test: Password Verification
```typescript
describe('AuthService.verifyPassword', () => {
  it('should verify correct password', async () => {
    const password = 'admin123'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)

    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const hash = await hashPassword('admin123')
    const isValid = await verifyPassword('wrongpassword', hash)

    expect(isValid).toBe(false)
  })
})
```

### Integration Tests

#### Test: Login API - Success
```typescript
describe('/api/auth/login', () => {
  it('should login with correct credentials', async () => {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: 'admin',
        password: 'admin123'
      }
    })

    expect(response.success).toBe(true)
    expect(response.user.username).toBe('admin')
  })
})
```

#### Test: Login API - Invalid Credentials
```typescript
it('should reject invalid credentials', async () => {
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: 'admin',
        password: 'wrongpassword'
      }
    })
    fail('Should have thrown error')
  } catch (error: any) {
    expect(error.statusCode).toBe(401)
    expect(error.message).toBe('Invalid credentials')
  }
})
```

#### Test: Login API - Missing Fields
```typescript
it('should reject missing username', async () => {
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        password: 'admin123'
      }
    })
    fail('Should have thrown error')
  } catch (error: any) {
    expect(error.statusCode).toBe(400)
  }
})
```

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Login success | 1. Go to /login<br>2. Enter: admin/admin123<br>3. Click Login | Redirect to /chat |
| Login wrong password | 1. Go to /login<br>2. Enter: admin/wrong<br>3. Click Login | Show error message |
| Login empty fields | 1. Go to /login<br>2. Leave fields empty<br>3. Click Login | Show validation error |
| Protected route | 1. Logout<br>2. Go to /chat directly | Redirect to /login |
| Remember session | 1. Login<br>2. Close browser<br>3. Reopen | Stay logged in (optional) |

---

## 2. Upload Feature Tests

### Unit Tests

#### Test: File Type Validation
```typescript
describe('DocumentService.validateFileType', () => {
  it('should accept PDF files', () => {
    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf'
    })
    const isValid = validateFileType(file)

    expect(isValid).toBe(true)
  })

  it('should accept TXT files', () => {
    const file = new File(['content'], 'test.txt', {
      type: 'text/plain'
    })
    const isValid = validateFileType(file)

    expect(isValid).toBe(true)
  })

  it('should reject other file types', () => {
    const file = new File(['content'], 'test.jpg', {
      type: 'image/jpeg'
    })
    const isValid = validateFileType(file)

    expect(isValid).toBe(false)
  })
})
```

#### Test: File Size Validation
```typescript
describe('DocumentService.validateFileSize', () => {
  it('should accept files under 5MB', () => {
    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf'
    })
    // Mock file size to 1MB
    Object.defineProperty(file, 'size', { value: 1024 * 1024 })

    const isValid = validateFileSize(file)

    expect(isValid).toBe(true)
  })

  it('should reject files over 5MB', () => {
    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf'
    })
    // Mock file size to 6MB
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 })

    const isValid = validateFileSize(file)

    expect(isValid).toBe(false)
  })
})
```

#### Test: Filename Sanitization
```typescript
describe('DocumentService.sanitizeFilename', () => {
  it('should remove special characters', () => {
    const filename = 'my document@#$%.pdf'
    const sanitized = sanitizeFilename(filename)

    expect(sanitized).toBe('my-document-.pdf')
  })

  it('should replace spaces with dashes', () => {
    const filename = 'my document.pdf'
    const sanitized = sanitizeFilename(filename)

    expect(sanitized).toBe('my-document.pdf')
  })

  it('should handle Thai characters', () => {
    const filename = 'เอกสาร.pdf'
    const sanitized = sanitizeFilename(filename)

    expect(sanitized).toBe('เอกสาร.pdf')
  })
})
```

### Integration Tests

#### Test: Upload API - Success
```typescript
describe('/api/upload', () => {
  it('should upload PDF file successfully', async () => {
    const formData = new FormData()
    const file = new File(['content'], 'test.pdf', {
      type: 'application/pdf'
    })
    formData.set('file', file)

    const response = await $fetch('/api/upload/post', {
      method: 'POST',
      body: formData,
      headers: {
        Cookie: 'user_id=1' // Mock logged in user
      }
    })

    expect(response.success).toBe(true)
    expect(response.document.filename).toBe('test.pdf')
  })
})
```

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Upload PDF success | 1. Go to /upload<br>2. Select PDF (1MB)<br>3. Click Upload | Show success, add to list |
| Upload TXT success | 1. Go to /upload<br>2. Select TXT (10KB)<br>3. Click Upload | Show success, add to list |
| Upload invalid type | 1. Go to /upload<br>2. Select JPG<br>3. Click Upload | Show error: "Only PDF and TXT files are allowed" |
| Upload oversized | 1. Go to /upload<br>2. Select PDF (6MB)<br>3. Click Upload | Show error: "File size exceeds 5MB limit" |
| Upload without login | 1. Logout<br>2. Go to /upload | Redirect to /login |
| Thai filename | 1. Upload PDF with Thai name | Upload successfully, name preserved |
| Special chars in name | 1. Upload PDF with special chars | Name sanitized, upload successfully |

---

## 3. Chat Feature Tests

### Unit Tests

#### Test: Token Counting
```typescript
describe('ChatService.countTokens', () => {
  it('should count tokens correctly', () => {
    const text = 'Hello, how are you?'
    const tokens = countTokens(text)

    expect(tokens).toBeGreaterThan(0)
  })

  it('should handle empty text', () => {
    const tokens = countTokens('')

    expect(tokens).toBe(0)
  })
})
```

#### Test: Message Formatting
```typescript
describe('ChatService.formatMessage', () => {
  it('should format user message', () => {
    const message = formatMessage('user', 'Hello')

    expect(message.role).toBe('user')
    expect(message.content).toBe('Hello')
    expect(message.timestamp).toBeDefined()
  })
})
```

### Integration Tests

#### Test: Chat API - Success
```typescript
describe('/api/chat', () => {
  it('should send message and receive response', async () => {
    const response = await $fetch('/api/chat/post', {
      method: 'POST',
      body: {
        message: 'Hello, how are you?'
      },
      headers: {
        Cookie: 'user_id=1'
      }
    })

    expect(response.message).toBeDefined()
    expect(response.tokens).toBeDefined()
    expect(response.tokens.input).toBeGreaterThan(0)
    expect(response.tokens.output).toBeGreaterThan(0)
  })
})
```

#### Test: Chat API - With Document
```typescript
it('should include document context', async () => {
  const response = await $fetch('/api/chat/post', {
    method: 'POST',
    body: {
      message: 'What is the salary?',
      documentId: 1
    },
    headers: {
      Cookie: 'user_id=1'
    }
  })

  expect(response.message).toContain('30,000') // Assuming contract.pdf
})
```

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Basic chat | 1. Go to /chat<br>2. Type "Hello"<br>3. Click Send | AI responds |
| Chat with document | 1. Select document<br>2. Ask question about it<br>3. Click Send | AI answers using document |
| Empty message | 1. Leave input empty<br>2. Click Send | Show error or disable button |
| Long message | 1. Type long message (1000 chars)<br>2. Click Send | AI handles it |
| Token display | 1. Send message<br>2. Check token count | Shows correct count |
| Session tokens | 1. Send 3 messages<br>2. Check session total | Shows cumulative count |
| Chat without login | 1. Logout<br>2. Go to /chat | Redirect to /login |
| AI error handling | 1. Mock API failure<br>2. Send message | Show error message |
| Timeout handling | 1. Mock slow API (>30s)<br>2. Send message | Show timeout error |

---

## 4. Token Usage Tests

### Unit Tests

#### Test: Token Calculation
```typescript
describe('TokenService.calculateTotal', () => {
  it('should sum tokens from messages', () => {
    const tokens = [
      { input: 10, output: 20 },
      { input: 15, output: 25 }
    ]
    const total = calculateTotal(tokens)

    expect(total).toBe(70) // (10+20) + (15+25)
  })
})
```

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Token count per message | 1. Send message<br>2. Check token count | Shows input/output/total |
| Session total | 1. Send 5 messages<br>2. Check session total | Shows correct sum |
| Session persistence | 1. Send messages<br>2. Refresh page<br>3. Check total | Total persists |

---

## 5. Error Handling Tests

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Network error | 1. Disconnect internet<br>2. Try to chat | Show network error |
| API error | 1. Mock API error<br>2. Try to chat | Show friendly error message |
| Database error | 1. Corrupt database<br>2. Try to login | Show error message |
| File read error | 1. Upload corrupted PDF<br>2. Try to chat with it | Show error message |

---

## 6. Performance Tests

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| Page load time | 1. Open DevTools<br>2. Reload page | Load < 2s |
| Chat response time | 1. Send message<br>2. Measure time | Response < 30s |
| Upload time | 1. Upload 5MB PDF<br>2. Measure time | Upload < 10s |
| Large document chat | 1. Upload large PDF<br>2. Ask question | Response < 30s |

---

## 7. Security Tests

### Manual Tests

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| SQL injection | 1. Enter: `admin' OR '1'='1`<br>2. Try to login | Login fails |
| XSS attack | 1. Send: `<script>alert(1)</script>`<br>2. Check response | Script not executed |
| File type bypass | 1. Rename .exe to .pdf<br>2. Try to upload | Upload rejected |
| Path traversal | 1. Enter filename: `../../etc/passwd`<br>2. Try to upload | Path sanitized |
| Session hijacking | 1. Copy cookie from another user<br>2. Try to access | Invalid session |

---

## 8. Compatibility Tests

### Browser Compatibility

| Browser | Version | Test | Result |
|---------|---------|------|--------|
| Chrome | Latest | All features | ✅ Pass |
| Firefox | Latest | All features | ✅ Pass |
| Safari | Latest | All features | ✅ Pass |
| Edge | Latest | All features | ✅ Pass |

### Device Compatibility

| Device | Screen Size | Test | Result |
|--------|------------|------|--------|
| Desktop | > 1024px | All features | ✅ Pass |
| Tablet | 768-1024px | All features | ✅ Pass |
| Mobile | < 768px | All features | ✅ Pass |

---

## Test Execution

### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests (if implemented)
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
```

---

## Test Checklist

Before submitting:

### Required Features
- [ ] Login works with admin/admin123
- [ ] Upload PDF works (1-5MB)
- [ ] Upload TXT works (1-5MB)
- [ ] Upload rejects invalid types
- [ ] Upload rejects oversized files
- [ ] Chat works without document
- [ ] Chat works with document
- [ ] Token counter works
- [ ] Session tracking works

### Error Handling
- [ ] Login shows error for wrong password
- [ ] Upload shows error for invalid file
- [ ] Chat shows error for API failure
- [ ] All errors are user-friendly

### Security
- [ ] Passwords hashed
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] File types validated
- [ ] Paths sanitized

### Performance
- [ ] Page load < 2s
- [ ] Chat response < 30s
- [ ] Upload < 10s

### Documentation
- [ ] README.md complete
- [ ] AI_JOURNAL.md has 15+ sessions
- [ ] DECISIONS.md has 3 decisions
- [ ] Git history is clean

---

## Notes

- **Test frequently** — Don't wait until the end
- **Test edge cases** — Empty inputs, large files, etc.
- **Test manually** — Automated tests can't catch everything
- **Document bugs** — Keep a bug list as you find them
- **Fix critical bugs first** — Login, upload, chat must work
