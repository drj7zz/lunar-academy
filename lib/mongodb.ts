import { MongoClient } from "mongodb";

// Reuse one connection between requests (serverless functions restart often).
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return Promise.reject(new Error("MONGODB_URI is not set"));

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    global._mongoClientPromise = client.connect().catch((err) => {
      global._mongoClientPromise = undefined; // allow a retry next request
      throw err;
    });
  }
  return global._mongoClientPromise;
}