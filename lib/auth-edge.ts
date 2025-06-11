import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'spa-secret-key-super-secure-2024';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  professionalData?: any;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return bcrypt.compareSync(password, hashedPassword);
}

export async function generateTokenEdge(user: AuthUser): Promise<string> {
  const jwt = await new SignJWT({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  return jwt;
}

export async function verifyTokenEdge(token: string): Promise<AuthUser | null> {
  try {
    console.log("🔐 EDGE: VERIFYING TOKEN:", token.substring(0, 50) + "...");
    console.log("🔑 EDGE: Using JWT_SECRET:", JWT_SECRET.substring(0, 20) + "...");
    
    const { payload } = await jwtVerify(token, secret);
    console.log("✅ EDGE: Token verification successful:", payload);
    
    const result = {
      id: payload.id as string,
      email: payload.email as string,
      firstName: payload.firstName as string,
      lastName: payload.lastName as string,
      role: payload.role as string,
    };
    
    console.log("👤 EDGE: Returning user data:", result);
    return result;
  } catch (error) {
    console.error("❌ EDGE: Token verification failed:", error);
    if (error instanceof Error) {
      console.error("🔍 EDGE: Error type:", error.name);
      console.error("🔍 EDGE: Error message:", error.message);
    }
    return null;
  }
} 