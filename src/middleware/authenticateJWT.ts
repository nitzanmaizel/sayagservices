import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    res.status(401).json({ error: 'Token error' });
    return;
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    res.status(401).json({ error: 'Token malformed' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      res.status(401).json({ error: 'Token invalid' });
      return;
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      isAdmin: decoded.isAdmin,
    };

    next();
  });
}
