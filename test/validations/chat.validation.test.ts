import { describe, it, expect } from 'vitest';
import { chatSchema } from '~~/shared/validations/chat.validation';

describe('Chat Validation Schema', () => {
  it('should validate valid chat input', () => {
    const input = { message: 'Hello AI' };
    const result = chatSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should validate valid chat input with documentId', () => {
    const input = { message: 'What is in this file?', documentId: 1 };
    const result = chatSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject empty message', () => {
    const input = { message: '' };
    const result = chatSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('กรุณากรอกข้อความ');
    }
  });

  it('should reject message exceeding maximum length', () => {
    const input = { message: 'a'.repeat(5001) };
    const result = chatSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('ข้อความต้องมีความยาวไม่เกิน 5000 ตัวอักษร');
    }
  });

  it('should reject invalid documentId', () => {
    const input = { message: 'Hello', documentId: -1 };
    const result = chatSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should reject non-numeric documentId', () => {
    const input = { message: 'Hello', documentId: 'abc' };
    const result = chatSchema.safeParse(input as any);
    expect(result.success).toBe(false);
  });
});
