import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  console.log("🔍 MIDDLEWARE: Processing path:", pathname);

  // Public paths that don't require authentication
  const publicPaths = [
    "/", 
    "/login", 
    "/register", 
    "/sign-in", 
    "/sign-up", 
    "/debug-auth",
    "/servicios",
    "/contacto"
  ];
  const isPublicPath = publicPaths.includes(pathname);

  // API routes that don't require authentication
  const publicApiPaths = [
    "/api/auth/login", 
    "/api/auth/register", 
    "/api/auth/debug",
    "/api/services"
  ];
  const isPublicApiPath = publicApiPaths.some(path => pathname.startsWith(path));

  console.log("🔍 MIDDLEWARE: isPublicPath:", isPublicPath);
  console.log("🔍 MIDDLEWARE: isPublicApiPath:", isPublicApiPath);

  // If it's a public path, allow access
  if (isPublicPath || isPublicApiPath) {
    console.log("✅ MIDDLEWARE: Public path, allowing access");
    return NextResponse.next();
  }

  // Check for token in cookies
  const token = request.cookies.get("spa-auth-token")?.value;
  console.log("🔍 MIDDLEWARE: Token found:", !!token);
  console.log("🔍 MIDDLEWARE: Token value:", token ? `${token.substring(0, 20)}...` : "none");

  if (!token) {
    console.log("❌ MIDDLEWARE: No token, redirecting to login");
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token using the Edge Runtime compatible function
  console.log("🔍 MIDDLEWARE: Verifying token...");
  const decoded = await verifyTokenEdge(token);
  console.log("🔍 MIDDLEWARE: Token verification result:", !!decoded);
  console.log("🔍 MIDDLEWARE: Decoded user:", decoded ? { id: decoded.id, role: decoded.role } : "none");
  
  if (!decoded) {
    console.log("❌ MIDDLEWARE: Invalid token, redirecting to login");
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  console.log("✅ MIDDLEWARE: Token valid, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
