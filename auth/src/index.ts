import { app } from './app';
import mongoose from 'mongoose';

const start = async () => {
  console.log('Starting ...');
  //check we can import jwt token specified in k8s deployment file
  if (!process.env.JWT_KEY) {
    throw new Error('JWT must be defined');
  }

  //check we can import mongo db uri specified in k8s deployment file
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  //conect to mongodb
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
