import type { H3Event } from 'h3';

export interface UploadedFile {
  file: File;
  buffer: Buffer;
  filename: string;
  contentType: string;
}

export interface FormDataResult {
  fields: Record<string, string>;
  file?: UploadedFile;
}

export interface ReadFormDataOptions {
  maxFileSize?: number;
}

/**
 * Read multipart form data from request
 * Parses form fields and extracts uploaded files
 */
export async function readMultipartRequest(
  event: H3Event,
  options: ReadFormDataOptions = {}
): Promise<FormDataResult> {
  const { maxFileSize = 5 * 1024 * 1024 } = options;

  // Get content type
  const contentType = event.node.req.headers['content-type'] || '';

  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type must be multipart/form-data');
  }

  // Read the request body as buffer
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    event.node.req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);

      // Check total size
      const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
      if (totalSize > maxFileSize) {
        reject(new Error('Request body too large'));
      }
    });

    event.node.req.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks);

        // Parse multipart form data
        const result = await parseMultipartFormData(buffer, contentType);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

    event.node.req.on('error', reject);
  });
}

/**
 * Parse multipart form data from buffer
 */
async function parseMultipartFormData(
  buffer: Buffer,
  contentType: string
): Promise<FormDataResult> {
  // Extract boundary from content type
  const boundaryMatch = contentType.match(/boundary=([^;]+)/i);

  if (!boundaryMatch) {
    throw new Error('Invalid content type: missing boundary');
  }

  const boundary = '--' + boundaryMatch[1];

  // Split by boundary
  const parts = buffer.toString('binary').split(boundary);

  const result: FormDataResult = {
    fields: {},
  };

  // Process each part (skip first and last empty parts)
  for (let i = 1; i < parts.length - 1; i++) {
    const part = parts[i];

    if (!part) continue;

    // Split headers from body
    const headerEnd = part.indexOf('\r\n\r\n');

    if (headerEnd === -1) continue;

    const headers = part.substring(0, headerEnd);
    const body = part.substring(headerEnd + 4);

    // Parse headers
    const nameMatch = headers.match(/name="([^"]+)"/i);
    const filenameMatch = headers.match(/filename="([^"]*)"/i);
    const contentTypeMatch = headers.match(/Content-Type: ([^\r\n]+)/i);

    if (!nameMatch || !nameMatch[1]) continue;

    const name = nameMatch[1];
    const filename = filenameMatch ? filenameMatch[1] : null;

    if (filename) {
      // This is a file upload
      const fileContentType = (contentTypeMatch && contentTypeMatch[1]) ? contentTypeMatch[1].trim() : 'application/octet-stream';

      // Convert body back to buffer (remove trailing CRLF)
      const fileBuffer = Buffer.from(body.substring(0, body.length - 2), 'binary');

      // Create File object
      const file = new File([fileBuffer], filename, {
        type: fileContentType,
      });

      result.file = {
        file,
        buffer: fileBuffer,
        filename,
        contentType: fileContentType,
      };
    } else {
      // This is a regular form field
      result.fields[name] = body.substring(0, body.length - 2);
    }
  }

  return result;
}
