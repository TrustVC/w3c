/**
 * Attachment upload configuration.
 * Can be overridden via env for different environments.
 */
export const ATTACHMENT_CONFIG = {
  maxTotalBytes: 10 * 1024 * 1024, // 10 MB
  maxFiles: 10,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'] as const,
  allowedExtensions: ['.jpg', '.jpeg', '.png'] as const,
};

export const ALLOWED_FILE_TYPES = ATTACHMENT_CONFIG.allowedTypes;
export const ALLOWED_FILE_EXTENSIONS = ATTACHMENT_CONFIG.allowedExtensions;
export const MAX_TOTAL_UPLOAD_BYTES = ATTACHMENT_CONFIG.maxTotalBytes;
export const MAX_FILES = ATTACHMENT_CONFIG.maxFiles;

export function isValidFileType(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  return (
    ATTACHMENT_CONFIG.allowedTypes.includes(
      file.type.toLowerCase() as (typeof ATTACHMENT_CONFIG.allowedTypes)[number],
    ) ||
    ATTACHMENT_CONFIG.allowedExtensions.includes(
      ext as (typeof ATTACHMENT_CONFIG.allowedExtensions)[number],
    )
  );
}

export function getFileConstraintText(): string {
  return 'Maximum 10 MB total size. Supported files include .JPG or .PNG only.';
}
