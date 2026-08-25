import { Request, Response, NextFunction } from 'express';

// 404 handler
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

export const notFoundHandler = notFound;

// Global error handler
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ success: false, message });
};
