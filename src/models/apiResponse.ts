// src/models/apiResponse.ts
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
