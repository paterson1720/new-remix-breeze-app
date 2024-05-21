import { BreezeAuthSessionUser } from "@remix-breeze/auth";
import { SessionIdStorageStrategy, createSessionStorage } from "@remix-run/node"; // or cloudflare/deno
import { prisma } from "prisma/client";

export function createPrismaDatabaseSessionStorage({
  cookie,
}: {
  cookie: SessionIdStorageStrategy["cookie"];
}) {
  return createSessionStorage<{ user: BreezeAuthSessionUser }>({
    cookie,
    async createData(data, expires) {
      // `expires` is a Date after which the data should be considered
      // invalid. You could use it to automatically purge this record from your database.
      // Like a ttl in MongoDB or a trigger in SQL or scheduled task to delete the record.
      const session = await prisma.session.create({
        data: {
          sessionData: JSON.stringify(data),
          userId: data.user!.id,
          expires,
        },
      });

      return session.id;
    },
    async readData(id) {
      const session = await prisma.session.findUnique({
        where: { id },
      });

      if (!session) return null;

      return JSON.parse(session.sessionData);
    },
    async updateData(id, data, expires) {
      await prisma.session.update({
        where: { id },
        data: {
          sessionData: JSON.stringify(data),
          expires,
        },
      });
    },
    async deleteData(id) {
      await prisma.session.delete({
        where: { id },
      });
    },
  });
}
