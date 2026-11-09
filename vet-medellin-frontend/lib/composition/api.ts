import type { ApiPort } from '@/lib/application/ports/api-port';
import { API_BASE_URL, httpApi } from '@/lib/infrastructure/http-client';

/** Composition root: binds the application port to the fetch based HTTP adapter. */
export const api: ApiPort = httpApi;
export { API_BASE_URL };
