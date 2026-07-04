import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error.' : (err.message || 'Internal Server Error.');

  if (status === 500) {
    console.error('[Centralized Error Handler] Unexpected system error:', err);
  }

  res.status(status).json({ error: message });
}
