import { z } from 'zod';

/**
 * File type enum
 */
const fileTypeEnum = z.enum(['pdf', 'txt']);

/**
 * Upload document validation schema
 */
export const uploadDocumentSchema = z.object({
  file: z.any()
    .refine((file) => file, 'File is required')
    .refine((file) => {
      const allowedTypes = ['application/pdf', 'text/plain'];
      return allowedTypes.includes(file?.type);
    }, 'Only PDF and TXT files are allowed')
    .refine((file) => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      return file?.size && file.size <= maxSize;
    }, 'File size must be less than 5MB')
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

/**
 * Validate upload input
 */
export function validateUploadInput(data: unknown) {
  return uploadDocumentSchema.safeParse(data);
}
