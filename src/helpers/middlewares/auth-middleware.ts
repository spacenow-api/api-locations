import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';

import Token from '../utils/token';

import * as config from './../../config';

const fetchUserById = async (id: string): Promise<string> => {
  const { data } = await axios.get(`${config.USERS_AUTHENTICATION_API_HOST}/users/legancy/${id}`);
  if (data && data.email)
    return Promise.resolve(data.email);
  return Promise.reject();
}

async function authMiddleware(req: Request, _: Response, next: NextFunction) {
  const token = Token.get(req);
  if (token && token !== 'undefined') {
    const secret: string = process.env.JWT_SECRET || 'Spacenow';
    try {
      const { id }: any = await jwt.verify(token, secret);
      const email: string = await fetchUserById(id);
      console.debug(`User ${email} verified.`);
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
