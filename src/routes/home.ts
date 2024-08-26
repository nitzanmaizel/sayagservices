import { Router, Request, Response } from 'express';

const router = Router();
//

router.get('/home', (_req: Request, res: Response) => {
  res.send('Welcome to the Home Page!');
});

export default router;
