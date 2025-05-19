
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://alcodeagency:AiKiZd5vzUeiOliZi@islandloaf0.f6gf5t.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  minPoolSize: 0,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true,
  maxIdleTimeMS: 120000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 10000,
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
    return client.db("islandloaf");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

export const db = client.db("islandloaf");
