import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';

import Token from '../utils/token';

async function authMiddleware(req: Request, _: Response, next: NextFunction) {
  const token = Token.get(req);
  if (token && token !== 'undefined') {
    const secret: string = process.env.JWT_SECRET || 'Spacenow';
    try {
      const { id }: any = await jwt.verify(token, secret);
      req.userIdDecoded = id;
      next();
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException());
  }
}

export default authMiddleware;
