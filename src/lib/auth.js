import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

// ─── Connection Caching for Serverless ────────────────────────────────────────
// In a serverless environment (Vercel), each cold start creates a new module
// instance. We cache the MongoClient on the global object so subsequent warm
// invocations reuse the existing connection pool instead of creating new ones.
// This prevents connection pool exhaustion under concurrent load.
let cachedClient = null;

function getMongoClient() {
  if (cachedClient) return cachedClient;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required in environment variables.");
  }

  cachedClient = new MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });

  // Proactively connect and log — errors are non-fatal for the module load
  cachedClient
    .connect()
    .then(() =>
      console.log(
        "SUCCESS: MongoClient established database connection to mediCareConnect."
      )
    )
    .catch((connErr) => {
      console.error(
        "CRITICAL ERROR: MongoClient failed connection to MongoDB Atlas:",
        connErr.message
      );
      // Reset cache on failure so the next request retries the connection
      cachedClient = null;
    });

  return cachedClient;
}

const client = getMongoClient();
const db = client.db("mediCareConnect");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    modelName: "users",
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "patient",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "active",
        required: false,
      },
    },
  },
});
