export interface ApiPort {
  request<T>(endpoint: string, options?: RequestInit): Promise<T>;
}
