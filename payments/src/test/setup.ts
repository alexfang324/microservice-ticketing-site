import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

//tell jest the file to mock by providing the "real" file location
jest.mock('../nats-wrapper');

// initialize a test mode stripe secret key
process.env.STRIPE_KEY =
  'sk_test_51LkGM4JcDta1vOMF95e0zBPQ1dks1C5mHdMmm0ZdvKTQnJ7JUMK9K4bl4cIB7FiVgrTMk066EoDShvpAwBn3s05700BStedtFa';

let mongo: any;
beforeAll(async () => {
  //randomly initialized JWT_KEY env variable
  process.env.JWT_KEY = 'asdfkjlskfj';

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
