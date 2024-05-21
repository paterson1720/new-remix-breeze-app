// // This is your Prisma schema file,
// // learn more about it in the docs: https://pris.ly/d/prisma-schema
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seed() {
  // connect to the database
  await prisma.$connect();

  // clean up the database
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // create users
  const hashedPassword = await bcrypt.hash("Password@123", 10);

  const createdNormalUser = await prisma.user.create({
    data: {
      email: "test@user.com",
      password: hashedPassword,
      fullName: "Test User",
      firstName: "Test",
      lastName: "User",
    },
  });

  const createdAdminUser = await prisma.user.create({
    data: {
      email: "test@admin.com",
      password: hashedPassword,
      fullName: "Test Admin",
      firstName: "Test",
      lastName: "Admin",
    },
  });

  // create roles
  const adminRole = await prisma.role.create({
    data: {
      name: "admin",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: "user",
    },
  });

  // assign roles to users
  await prisma.userRole.createMany({
    data: [
      {
        userId: createdNormalUser.id,
        roleId: userRole.id,
      },
      {
        userId: createdAdminUser.id,
        roleId: adminRole.id,
      },
    ],
  });

  console.log("Seeded database with test user and admin");
}

seed();
