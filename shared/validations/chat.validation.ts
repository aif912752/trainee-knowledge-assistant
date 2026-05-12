import { z } from 'zod';

/**
 * Chat validation schema
 */
export const chatSchema = z.object({
  message: z.string()
    .min(1, 'กรุณากรอกข้อความ')
    .max(5000, 'ข้อความต้องมีความยาวไม่เกิน 5000 ตัวอักษร'),
  documentId: z.number().int().positive().optional()
});

export type ChatInput = z.infer<typeof chatSchema>;
