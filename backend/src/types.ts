import type { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";

export type AppContext = {
  prisma: PrismaClient;
  user?: AuthUser;
  permissions: string[];
};

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  viewFinancials: boolean;
};
