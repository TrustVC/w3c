import { fetchClientSupport } from './fetchClient';

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
  };
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export const createServiceRequest = async (
  formData: FormData,
): Promise<CreateServiceRequestResponse> => {
  return fetchClientSupport.request<CreateServiceRequestResponse>('/service-request', {
    method: 'POST',
    body: formData,
  });
};
