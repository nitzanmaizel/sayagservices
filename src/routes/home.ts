import { Router, Request, Response } from 'express';

const router = Router();
//

router.get('/home', (req: Request, res: Response) => {
  console.log(req.session);

  res.send('Welcome to the Home Page!');
});

export default router;
