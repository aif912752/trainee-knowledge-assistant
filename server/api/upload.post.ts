import { DocumentService } from '~~/server/services/document.service';
import { readFormData } from '~~/server/utils/form-data';
import { UnauthorizedError, ValidationError, handleApiError } from '~~/server/utils/errors';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

    // Read form data with file
    const formData = await readFormData(event, {
      maxFileSize: MAX_FILE_SIZE,
    });

    const file = formData.file;

    if (!file) {
      const { data, status } = handleApiError(new ValidationError('ไม่พบไฟล์ที่อัปโหลด'));
      setResponseStatus(event, status);
      return data;
    }

    // Validate file size again (double check)
    if (file.file.size > MAX_FILE_SIZE) {
      const { data, status } = handleApiError(new ValidationError('ขนาดไฟล์ต้องไม่เกิน 5MB'));
      setResponseStatus(event, status);
      return data;
    }

    // Upload document using service
    const documentService = new DocumentService();
    const result = await documentService.uploadDocument(
      user.id,
      file.file,
      file.buffer
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
