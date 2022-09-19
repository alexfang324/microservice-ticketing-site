import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@afang324/common';
import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',

  //checking input with express-validator middleware
  [
    body('email').isEmail().withMessage('Must provide a valid email'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters')
  ],

  //self-defined validation result checking middleware
  validateRequest,

  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    //add new user to mongoDB
    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      //get jwt secret from env variables
      process.env.JWT_KEY!
    );

    //store it on cookie session object
    req.session = {
      jwt: userJWT
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
