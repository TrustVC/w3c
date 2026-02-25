import { fetchClientSupport } from './fetchClient';

export type PresignUploadItem = {
  key: string;
  uploadUrl: string;
  filename: string;
  expiresIn: number;
};

export type PresignResponse = {
  success: boolean;
  data?: { uploads: PresignUploadItem[] };
  error?: { message: string; code?: string };
};

export type CreateServiceRequestWithKeysPayload = {
  email: string;
  description: string;
  typeOfEnquiry: string;
  domain: string;
  attachmentKeys: { key: string; filename: string }[];
};

export type CreateServiceRequestResponse = {
  success: boolean;
  data?: {
    message: string;
    serviceRequest?: {
      id: string;
      issueKey: string;
      issueId: string;
      portalUrl: string;
      webUrl: string;
    };
    attachmentsUploaded?: number;
    attachmentsQueued?: number;
  };
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export async function getPresignedUrls(
  files: { filename: string; contentType: string; size?: number }[],
): Promise<PresignUploadItem[]> {
  const res = await fetchClientSupport.request<{
    success?: boolean;
    data?: { uploads: PresignUploadItem[] };
    error?: { message: string };
  }>('/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files }),
  });
  const uploads = (res as { data?: { uploads: PresignUploadItem[] } }).data?.uploads;
  if (!uploads)
    throw new Error(
      (res as { error?: { message: string } }).error?.message || 'Failed to get upload URLs',
    );
  return uploads;
}

export async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onProgress) onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.send(file);
  });
}

export async function createServiceRequestWithKeys(
  payload: CreateServiceRequestWithKeysPayload,
): Promise<CreateServiceRequestResponse> {
  return fetchClientSupport.request<CreateServiceRequestResponse>('/service-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
