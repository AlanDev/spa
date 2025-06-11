import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 DEBUG: Checking authentication...");
    console.log("🌍 DEBUG: NODE_ENV:", process.env.NODE_ENV);
    console.log("🌐 DEBUG: Request URL:", request.url);
    console.log("🌐 DEBUG: Request headers host:", request.headers.get('host'));
    
    // Check for spa-auth-token specifically
    const token = request.cookies.get("spa-auth-token")?.value;
    console.log("🎫 Token found:", token ? "YES" : "NO");
    console.log("🎫 Token value:", token ? token.substring(0, 50) + "..." : "NONE");
    console.log("🍪 Total cookies in request:", request.cookies.size);
    
    if (!token) {
      return NextResponse.json({
        authenticated: false,
        reason: "No token found",
        hasCookies: request.cookies.size > 0,
        cookieCount: request.cookies.size,
      });
    }
    
    // Try to verify token using Edge Runtime compatible function
    const decoded = await verifyTokenEdge(token);
    console.log("✅ Token decoded:", decoded ? "YES" : "NO");
    console.log("👤 User data:", decoded);
    
    if (!decoded) {
      return NextResponse.json({
        authenticated: false,
        reason: "Invalid token",
        tokenExists: true,
      });
    }
    
    return NextResponse.json({
      authenticated: true,
      user: decoded,
      cookieCount: request.cookies.size,
    });
    
  } catch (error) {
    console.error("❌ Debug error:", error);
    return NextResponse.json({
      authenticated: false,
      reason: "Error in debug",
      error: error instanceof Error ? error.message : String(error),
    });
  }
} 