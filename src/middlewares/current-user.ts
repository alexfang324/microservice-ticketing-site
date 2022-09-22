import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
}

//modify the Express Request type definition to add in an optional currentUser field
declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const CurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //check if cookie is provided and if a jwt is in it
  if (!req.session?.jwt) {
    return next();
  }

  //if jwt is invalid, jwt.verify will throw an error
  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;

    // set the optional currentUser field to be user info
    req.currentUser = payload;
  } catch (err) {}
  next();
};
