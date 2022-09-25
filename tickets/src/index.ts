import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/publishers/listeners/order-created-listener';
import { OrderCancelledListener } from './events/publishers/listeners/order-cancelled-listener';

const start = async () => {
  console.log('STARTING ...');

  //check we can import jwt token specified in k8s deployment file
  if (!process.env.JWT_KEY) {
    throw new Error('JWT must be defined');
  }

  //check we can import mongo db uri specified in k8s deployment file
  if (!process.env.MONGO_URI) {
    throw new Error('MANGO_URI must be defined');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URI) {
    throw new Error('NATS_URI must be defined');
  }

  //conect to mongodb and NATS
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    //Listening to events
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDb');
  } catch (err) {
    console.log(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

start();
