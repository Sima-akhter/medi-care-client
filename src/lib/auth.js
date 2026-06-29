import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import dns from "dns";

// Configure fallback DNS servers defensively to prevent local network SRV lookup ETIMEOUTs
try {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
} catch (dnsErr) {
  console.warn("DNS fallback configurations warning:", dnsErr.message);
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is required in environment variables.");
}

const client = new MongoClient(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
  connectTimeoutMS: 5000
});
const db = client.db("mediCareConnect");

// Proactively trigger client connection at startup and trace failures with descriptive logging
client.connect()
  .then(() => console.log("SUCCESS: MongoClient established database connection to mediCareConnect."))
  .catch((connErr) => console.error("CRITICAL ERROR: MongoClient failed connection to MongoDB Atlas:", connErr.message));


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
