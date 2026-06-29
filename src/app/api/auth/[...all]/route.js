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
    const response = await handler.POST(req);

    // Capture Better Auth sign-out API calls and discard the jwt_token cookie
    const url = new URL(req.url);
    if (url.pathname.endsWith("/sign-out")) {
      const isSecure = url.protocol === "https:" || process.env.NODE_ENV === "production";
      const secureFlag = isSecure ? "; Secure" : "";

      // Copy response headers to update them
      const newHeaders = new Headers(response.headers);

      // 1. Delete standard client-writable cookie on root path
      newHeaders.append(
        "Set-Cookie",
        `jwt_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`
      );

      // 2. Delete server-only HttpOnly cookie on root path
      newHeaders.append(
        "Set-Cookie",
        `jwt_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}; HttpOnly`
      );

      // 3. Delete cookie targeting current hostname explicitly
      newHeaders.append(
        "Set-Cookie",
        `jwt_token=; Domain=${url.hostname}; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`
      );

      // Return a new response object containing the modified headers
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    return response;
  } catch (err) {
    console.error("Better Auth API handler POST exception:", err);
    throw err;
  }
};

