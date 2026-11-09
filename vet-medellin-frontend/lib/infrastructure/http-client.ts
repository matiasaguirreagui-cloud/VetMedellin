export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export class HttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'HttpError';
  }
}

export async function requestJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new HttpError('No fue posible conectar con la API veterinaria.', 0);
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'message' in payload
      ? String(payload.message)
      : `Error de API (${response.status})`;
    throw new HttpError(message, response.status);
  }
  if (payload === null) throw new HttpError('El backend devolvió una respuesta vacía o inválida.', response.status);
  return payload as T;
}
import type { ApiPort } from '@/lib/application/ports/api-port';


export const httpApi: ApiPort = { request: requestJson };
