import { Prisma } from "@prisma/client";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

export type UserGet = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: true;
      };
    };
  };
}>;
