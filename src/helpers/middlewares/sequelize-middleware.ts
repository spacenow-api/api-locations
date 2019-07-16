import { NextFunction, Response, Request } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  console.debug('Running Database middleware.');
  // todo: Looking for an approach to turn Sync database dynamicaly, to 'NOT' sync in production. [Arthemus]
  // sequelize.sync();
  next();
};
