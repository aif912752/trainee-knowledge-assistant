import { z } from 'zod';

/**
 * Upload document validation schema
 */
export const uploadDocumentSchema = z.object({
  file: z.any()
    .refine((file) => file, 'กรุณาเลือกไฟล์')
    .refine((file) => {
      const allowedTypes = ['application/pdf', 'text/plain'];
      return allowedTypes.includes(file?.type);
    }, 'อนุญาตเฉพาะไฟล์ PDF และ TXT เท่านั้น')
    .refine((file) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      return file?.size && file.size <= maxSize;
    }, 'ขนาดไฟล์ต้องไม่เกิน 5MB')
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
