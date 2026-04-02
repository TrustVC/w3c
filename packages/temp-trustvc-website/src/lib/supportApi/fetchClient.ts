type FetchClientOptions = {
  baseUrl: string;
};

export type FetchClientErrorDetails = {
  status: number;
  message: string;
  data?: unknown;
};

export class FetchClientError extends Error {
  public readonly status: number;
  public readonly data?: unknown;

  constructor(details: FetchClientErrorDetails) {
    super(details.message);
    this.name = 'FetchClientError';
    this.status = details.status;
    this.data = details.data;
  }
}

export const createFetchClient = ({ baseUrl }: FetchClientOptions) => {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`${normalizedBaseUrl}${path}`, init);

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok || (data && (data as { success?: boolean }).success === false)) {
      const msg =
        (data as { error?: { message?: string }; message?: string })?.error?.message ??
        (data as { message?: string })?.message ??
        `Request failed with status ${response.status}`;
      throw new FetchClientError({ status: response.status, message: msg, data });
    }

    return data as T;
  };

  return { request };
};

export const fetchClientSupport = createFetchClient({
  baseUrl: (import.meta.env?.VITE_SUPPORT_API_BASE_URL as string) ?? '',
});
