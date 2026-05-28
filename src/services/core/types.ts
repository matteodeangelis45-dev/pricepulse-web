export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedParams {
  limit?: number;
  cursor?: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null };
}

export function fail<T>(error: unknown): ServiceResult<T> {
  return { data: null, error: error instanceof Error ? error.message : String(error) };
}
