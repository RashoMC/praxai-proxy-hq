import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Railway database URL fallback
const DATABASE_URL = process.env.DATABASE_URL || 
  "postgresql://postgres:cBJHoVXiipqMYlPQkdZcvynHYkUHxunp@turntable.proxy.rlwy.net:26863/railway";

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
