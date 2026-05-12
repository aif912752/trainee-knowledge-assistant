import { DocumentService } from '~~/server/services/document.service';
import { readFormData } from '~~/server/utils/form-data';
import { UnauthorizedError, ValidationError, handleApiError } from '~~/server/utils/errors';
import { uploadDocumentSchema } from '~~/shared/validations';
import { validateOrThrow } from '~~/shared/validations/helpers';

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
    // Note: readFormData still uses a default max size for the raw stream parsing
    const formData = await readFormData(event);
    
    // Validate using shared schema
    validateOrThrow(uploadDocumentSchema, { file: formData.file?.file });

    // At this point we know formData.file exists and is valid
    const file = formData.file!;

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
