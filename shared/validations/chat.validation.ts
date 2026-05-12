import { z } from 'zod';

/**
 * Chat validation schema
 */
export const chatSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(5000, 'Message must be less than 5000 characters'),
  documentId: z.number().int().positive().optional()
});

export type ChatInput = z.infer<typeof chatSchema>;
