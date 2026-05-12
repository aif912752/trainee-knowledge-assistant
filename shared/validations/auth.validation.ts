import { z } from 'zod';

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  username: z.string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้งาน')
    .max(50, 'ชื่อผู้ใช้งานต้องมีความยาวไม่เกิน 50 ตัวอักษร')
    .regex(/^[a-zA-Z0-9_]+$/, 'ชื่อผู้ใช้งานต้องประกอบด้วยตัวอักษร ตัวเลข และเครื่องหมายขีดล่างเท่านั้น'),
  password: z.string()
    .min(1, 'กรุณากรอกรหัสผ่าน')
    .max(100, 'รหัสผ่านต้องมีความยาวไม่เกิน 100 ตัวอักษร')
});

export type LoginInput = z.infer<typeof loginSchema>;
