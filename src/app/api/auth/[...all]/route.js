import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handler = toNextJsHandler(auth);

export const GET = async (req) => {
  try {
    return await handler.GET(req);
  } catch (err) {
    console.error("Better Auth API handler GET exception:", err);
    throw err;
  }
};

export const POST = async (req) => {
  try {
    return await handler.POST(req);
  } catch (err) {
    console.error("Better Auth API handler POST exception:", err);
    throw err;
  }
};

