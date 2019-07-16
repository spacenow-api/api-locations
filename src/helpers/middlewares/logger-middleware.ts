import { NextFunction, Response, Request } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  console.debug(`${req.method} ${req.path}`);
  next();
};
