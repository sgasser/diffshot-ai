export class DiffShotError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DiffShotError';
  }
}

export function handleError(error: unknown): { message: string; stack?: string } {
  if (error instanceof DiffShotError) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

export function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
