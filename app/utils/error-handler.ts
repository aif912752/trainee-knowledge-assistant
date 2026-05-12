/**
 * Centralized error handler for the application
 * Maps error codes to user-friendly messages
 */

export const ERROR_MESSAGES: Record<string, string> = {
  // Auth Errors
  'UNAUTHORIZED': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  'SESSION_EXPIRED': 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  
  // Validation Errors
  'VALIDATION_ERROR': 'ข้อมูลที่ระบุไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  'BAD_REQUEST': 'คำขอไม่ถูกต้อง',
  
  // File Errors
  'FILE_TOO_LARGE': 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 5MB)',
  'INVALID_FILE_TYPE': 'ประเภทไฟล์ไม่รองรับ (รองรับเฉพาะ PDF และ TXT)',
  
  // AI/Chat Errors
  'AI_SERVICE_ERROR': 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่ในภายหลัง',
  'AI_TIMEOUT': 'การตอบสนองจาก AI ใช้เวลานานเกินไป',
  
  // Generic Errors
  'INTERNAL_SERVER_ERROR': 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
  'UNKNOWN_ERROR': 'เกิดข้อผิดพลาดที่ไม่รู้จัก',
};

/**
 * Get a user-friendly error message from an API error
 */
export function getErrorMessage(error: any): string {
  if (!error) return ERROR_MESSAGES.UNKNOWN_ERROR;

  // Handle FetchError from $fetch
  const errorData = error.data;
  
  if (errorData?.code && ERROR_MESSAGES[errorData.code]) {
    return ERROR_MESSAGES[errorData.code];
  }

  if (errorData?.error) {
    return errorData.error;
  }

  // Fallback to HTTP status codes if no specific code is provided
  const status = error.statusCode;
  if (status === 401) return ERROR_MESSAGES.UNAUTHORIZED;
  if (status === 400) return ERROR_MESSAGES.BAD_REQUEST;
  if (status === 404) return 'ไม่พบหน้าที่ต้องการ';
  if (status >= 500) return ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
}
