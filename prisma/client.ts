import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
prisma.$connect();

process.on("beforeExit", () => {
  prisma.$disconnect();
});

export { prisma };




