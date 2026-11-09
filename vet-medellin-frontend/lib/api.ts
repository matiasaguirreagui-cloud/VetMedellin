/** Compatibility facade for existing frontend modules. HTTP details live in the infrastructure adapter. */
export { API_BASE_URL, HttpError, requestJson as apiFetch } from '@/lib/infrastructure/http-client';
