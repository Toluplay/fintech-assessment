/** Error envelope returned by the NestJS API (see HttpExceptionFilter). */
export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: string[];
}

export type ApiErrorKind =
  | 'network'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'server'
  | 'unknown';
