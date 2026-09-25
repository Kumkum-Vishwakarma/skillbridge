import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

// Spins up one in-memory MongoDB instance for the entire test run and
// connects Mongoose to it — every model (User, Skill, ExchangeRequest)
// works against this exactly as it would against real Atlas.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

// Clears every collection between individual tests so tests never leak
// state into one another (e.g. a user created in one test file
// shouldn't affect a duplicate-email check in another).
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});