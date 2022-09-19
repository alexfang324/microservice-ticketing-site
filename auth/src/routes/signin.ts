import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { PasswordManager } from '../services/password-manager';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@afang324/common';

const router = express.Router();

router.post(
  '/api/users/signin',

  //checking input with express-validator middleware
  [
    body('email').isEmail().withMessage('Must provide a valid email'),
    body('password').trim().notEmpty().withMessage('Must provide a password')
  ],

  //self-defined validation result checking middleware
  validateRequest,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordMatch = await PasswordManager.compare(
      existingUser.password,
      password
    );

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    //Generate JWT
    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email
      },
      //get jwt secret from env variables
      process.env.JWT_KEY!
    );

    //store it on cookie session object
    req.session = {
      jwt: userJWT
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
