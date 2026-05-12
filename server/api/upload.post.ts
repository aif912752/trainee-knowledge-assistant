import { DocumentService } from '~~/server/services/document.service';
import { UnauthorizedError, ValidationError, handleApiError } from '~~/server/utils/errors';
import { successResponse } from '~~/server/utils/response';

/**
 * Upload file API endpoint
 * POST /api/upload
 *
 * Uses formidable for streaming multipart parsing
 * Saves original file to disk and extracts content to database
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('📥 Received upload request');
    // Get user from session (attached by protected middleware)
    const user = event.context.user;

    if (!user) {
      console.log('❌ Unauthorized upload attempt');
      return handleApiError(event, new UnauthorizedError('กรุณาเข้าสู่ระบบ'));
    }

    const documentService = new DocumentService();

    // Parse multipart request using formidable
    console.log('⏳ Parsing multipart data with formidable...');
    const { files } = await documentService.parseMultipartRequest(event);
    console.log('✅ Multipart data parsed successfully');
    
    // Get the uploaded file
    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return handleApiError(event, new ValidationError('ไม่พบไฟล์ที่อัปโหลด'));
    }

    // Upload and process document
    const result = await documentService.uploadDocument(user.id, file);

    return successResponse(event, {
      document: {
        id: result.id,
        filename: result.filename,
        originalName: result.originalName,
        fileType: result.fileType,
        fileSize: result.fileSize,
        contentLength: result.content?.length || 0,
      },
    }, 'อัปโหลดและประมวลผลไฟล์สำเร็จ');

  } catch (error) {
    return handleApiError(event, error);
  }
});
