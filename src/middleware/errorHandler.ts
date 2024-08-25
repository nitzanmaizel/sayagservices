import { Response } from 'express';

export function errorHandler(err: any, res: Response) {
  console.error(err.stack);

  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'An unknown error occurred' });
  }
}
