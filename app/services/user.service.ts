import { Role } from "@/lib/types/user.types";
import { User } from "@prisma/client";
import { prisma } from "prisma/client";

/**
 * ---------------------------
 * getUserById
 * ---------------------------
 * Get a user by their ID
 */
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

/**
 * ---------------------------
 * getUserByEmail
 * ---------------------------
 * Get a user by their email address.
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

/**
 * ---------------------------
 * getAllUsers
 * ---------------------------
 * Get all users in the database
 */
export async function getAllUsers() {
  return await prisma.user.findMany({
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

/**
 * ---------------------------
 * getFilteredPaginatedUsers
 * ---------------------------
 * Get paginated users
 */
export async function getFilteredPaginatedUsers(params: {
  page: number;
  perPage: number;
  search?: string;
}) {
  const { page, perPage, search = "" } = params;
  const skip = page * perPage;

  const users = await prisma.user.findMany({
    where: {
      OR: [{ fullName: { contains: search } }, { email: { contains: search } }],
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
    skip,
    take: perPage,
  });

  const totalDocument = await prisma.user.count({
    where: {
      OR: [{ fullName: { contains: search } }, { email: { contains: search } }],
    },
  });

  const totalPages = Math.ceil(totalDocument / perPage);

  return {
    users,
    perPage,
    totalPages,
  };
}

/**
 * ---------------------------
 * updateUser
 * ---------------------------
 * Update a user by their ID with the provided data object.
 */
export async function updateUser(id: string, data: Partial<User> & { roles?: string[] }) {
  const { roles, ...userData } = data;

  if (roles) {
    const roleNames = Array.from(new Set([Role.USER].concat(roles as Role[])));
    const roleRecords = await prisma.role.findMany({
      where: { name: { in: roleNames } },
      select: { id: true, name: true },
    });

    await prisma.userRole.deleteMany({
      where: { userId: id },
    });

    return await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        roles: {
          create: roleRecords.map((role) => ({
            role: {
              connect: role,
            },
          })),
        },
      },
      include: {
        roles: { include: { role: true } },
      },
    });
  }

  return await prisma.user.update({
    where: { id },
    data: userData,
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
}

/**
 * ---------------------------
 * deleteUser
 * ---------------------------
 * Delete a user by their ID
 */
export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}

/**
 * ---------------------------
 * mapUserToSessionUser
 * ---------------------------
 * Map a user object to a session user object
 */
export function mapUserToSessionUser(user: User & { roles: { role: { name: string } }[] }) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    avatar: user.avatar,
    emailVerified: user.emailVerified,
    roles: user.roles.map((item: any) => item.role.name),
  };
}
