/**
 * Thin fetch wrapper. Acquires a bearer token via the injected token getter,
 * attaches it, and surfaces RFC 7807 ProblemDetails as a typed ApiError so the
 * UI can present `detail` through MWS alert/error patterns — never a raw string.
 */

/** RFC 7807 ProblemDetails shape returned by the API on error. */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | null;

  constructor(status: number, problem: ProblemDetails | null, fallbackMessage: string) {
    super(problem?.detail ?? problem?.title ?? fallbackMessage);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** Field → messages map for validation (400) failures, if present. */
  get fieldErrors(): Record<string, string[]> | null {
    return this.problem?.errors ?? null;
  }
}

/** Returns a bearer access token (or null when unavailable). */
export type TokenGetter = () => Promise<string | null>;

export interface RequestOptions {
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function parseProblem(response: Response): Promise<ProblemDetails | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    return null;
  }
  try {
    return (await response.json()) as ProblemDetails;
  } catch {
    return null;
  }
}

export function createApiClient(getToken: TokenGetter) {
  async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const token = await getToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const init: RequestInit = {
      method: options.method ?? 'GET',
      headers,
      signal: options.signal,
    };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, init);

    if (!response.ok) {
      const problem = await parseProblem(response);
      throw new ApiError(response.status, problem, `Request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  return { request };
}

export type ApiClient = ReturnType<typeof createApiClient>;
