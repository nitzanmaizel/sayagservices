import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded: any) => {
      if (err) return res.sendStatus(403);
      req.body.user = decoded;
      return next();
    });
  } else {
    res.sendStatus(401);
  }
}
