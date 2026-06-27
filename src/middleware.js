import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedPath = pathname.startsWith("/dashboard");
  const isAuthPath = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!isProtectedPath && !isAuthPath) {
    return NextResponse.next();
  }

  let session = null;
  try {
    const sessionRes = await fetch(new URL("/api/auth/get-session", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    if (sessionRes.ok) {
      session = await sessionRes.json();
    }
  } catch (err) {
    console.error("Session verification failed in middleware:", err);
  }

  const isAuthenticated = session && session.user;

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register"
  ]
};
