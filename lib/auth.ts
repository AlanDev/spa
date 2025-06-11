import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'spa-secret-key-super-secure-2024';

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

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    console.log("🔐 VERIFYING TOKEN:", token.substring(0, 50) + "...");
    console.log("🔑 Using JWT_SECRET:", JWT_SECRET.substring(0, 20) + "...");
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("✅ Token verification successful:", decoded);
    
    const result = {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role,
    };
    
    console.log("👤 Returning user data:", result);
    return result;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    if (error instanceof Error) {
      console.error("🔍 Error type:", error.name);
      console.error("🔍 Error message:", error.message);
    }
    return null;
  }
} 