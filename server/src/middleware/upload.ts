import { extname } from 'node:path';
import multer from 'multer';
import { HttpError } from '../lib/http-error.js';

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

// Map of accepted MIME types → human-friendly label.
export const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
};

// Some browsers / OSes send odd MIMEs (e.g. application/octet-stream for .csv).
// Fall back to extension sniffing in that case.
const EXTENSION_MIME_FALLBACK: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
};

export function resolveMime(originalName: string, mime: string): string | null {
  if (SUPPORTED_MIME_TYPES[mime]) return mime;
  const ext = extname(originalName).toLowerCase();
  return EXTENSION_MIME_FALLBACK[ext] ?? null;
}

export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    const resolved = resolveMime(file.originalname, file.mimetype);
    if (!resolved) {
      cb(
        HttpError.badRequest(
          `Unsupported file type: ${file.mimetype || 'unknown'}. ` +
            `Supported: ${Object.values(SUPPORTED_MIME_TYPES).join(', ')}.`,
        ),
      );
      return;
    }
    file.mimetype = resolved;
    cb(null, true);
  },
}).single('file');
