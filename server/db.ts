import { MongoClient } from 'mongodb';
import ws from "ws";
import * as schema from "@shared/schema";

const uri = "mongodb+srv://alcodeagency:AiKiZd5vzUeiOliZi@islandloaf0.f6gf5t.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

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