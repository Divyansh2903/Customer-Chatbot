export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    if (details !== undefined) this.details = details;
  }

  static badRequest(message: string, details?: unknown): HttpError {
    return new HttpError(400, message, details);
  }

  static notFound(message = 'Not found'): HttpError {
    return new HttpError(404, message);
  }

  static internal(message = 'Internal server error'): HttpError {
    return new HttpError(500, message);
  }
}
