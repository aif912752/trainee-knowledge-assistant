import { DocumentService } from '~~/server/services/document.service';
import { readFormData } from 'h3';
import { UnauthorizedError, ValidationError, handleApiError } from '~~/server/utils/errors';
import { uploadDocumentSchema } from '~~/shared/validations';
import { validateOrThrow } from '~~/shared/validations/helpers';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Upload file API endpoint
 * POST /api/upload
 *
 * Accepts multipart/form-data with a file field
 * Returns uploaded document metadata
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user from session (attached by protected middleware)
    const user = event.context.user;

    if (!user) {
      const { data, status } = handleApiError(new UnauthorizedError('กรุณาเข้าสู่ระบบ'));
      setResponseStatus(event, status);
      return data;
    }

    // Read form data with file using H3's built-in readFormData
    const formData = await readFormData(event, {
      maxFileSize: MAX_FILE_SIZE,
    });

    const fileEntry = formData.get('file');

    if (!fileEntry || !(fileEntry instanceof File)) {
      const { data, status } = handleApiError(new ValidationError('ไม่พบไฟล์ที่อัปโหลด'));
      setResponseStatus(event, status);
      return data;
    }

    // Validate using shared schema
    validateOrThrow(uploadDocumentSchema, { file: fileEntry });

    // Convert File to Buffer
    const arrayBuffer = await fileEntry.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload document using service
    const documentService = new DocumentService();
    const result = await documentService.uploadDocument(
      user.id,
      fileEntry,
      buffer
    );

    return {
      success: true,
      message: 'อัปโหลดไฟล์สำเร็จ',
      document: {
        id: result.id,
        filename: result.filename,
        originalName: result.originalName,
        fileType: result.fileType,
        fileSize: result.fileSize,
        contentLength: result.content?.length || 0,
      },
    };

  } catch (error) {
    // FileValidationError has a 'code' property - treat as ValidationError
    if (error instanceof Error && 'code' in error) {
      const { data, status } = handleApiError(new ValidationError(error.message));
      setResponseStatus(event, status);
      return data;
    }

    const { data, status } = handleApiError(error);
    setResponseStatus(event, status);
    return data;
  }
});
