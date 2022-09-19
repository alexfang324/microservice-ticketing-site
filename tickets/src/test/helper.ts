import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const getAuthCookie = () => {
  // create a JWT using a payload format {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //build session object {jwt:MY_JWT} and turn it into JSON
  const sessionJSON = JSON.stringify({ jwt: token });

  //encode it in base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  //return the cookie string in a array for supertest
  return `session=${base64}`;
};
