import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

//tell jest the file to mock by provide the "real" file location
jest.mock('../nats-wrapper');

let mongo: any;
beforeAll(async () => {
  //randomly initialized JWT_KEY env variable
  process.env.JWT_KEY = 'asdfkjlskfj';

  //randomly initialized EXPIRATION_WINDOW_SECONDS env variable
  process.env.EXPIRATION_WINDOW_SECONDS = '300';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();

  if (mongo) {
    await mongo.stop();
  }
});
