import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "../config/env.js";

const adapter = new PrismaNeon({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});