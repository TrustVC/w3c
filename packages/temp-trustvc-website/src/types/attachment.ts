export type AttachmentFileStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

export interface AttachmentItem {
  id: string;
  file: File;
  key?: string;
  filename: string;
  status: AttachmentFileStatus;
  progress: number;
  error?: string;
  previewUrl?: string;
}

export function truncateFilename(name: string, maxLength = 32): string {
  if (name.length <= maxLength) return name;
  const ext = name.slice(name.lastIndexOf('.'));
  const base = name.slice(0, name.length - ext.length);
  const keep = maxLength - ext.length - 3; // "..."
  return base.slice(0, Math.max(0, keep)) + '...' + ext;
}
