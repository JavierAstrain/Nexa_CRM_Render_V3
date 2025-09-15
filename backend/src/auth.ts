import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import type { AuthUser } from "./types.js";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

export async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}
export async function comparePassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export function createToken(user: AuthUser) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      viewFinancials: user.viewFinancials
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      const u = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (u) {
        (req as any).user = {
          id: u.id,
          email: u.email,
          role: u.role,
          viewFinancials: u.viewFinancials
        } as AuthUser;
      }
    } catch (_e) {
      // ignore invalid token
    }
  }
  next();
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user as AuthUser | undefined;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
