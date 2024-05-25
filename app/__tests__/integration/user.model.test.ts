import auth from "@/lib/auth/auth.server";
import { UserDataError } from "@remix-breeze/auth";
import { prisma } from "prisma/client";

/**
 * -----------------------------
 * Exampe of integration test
 * -----------------------------
 * This test is an example of an integration test that tests the registration of a user
 * and validates the password requirements are met before creating the user in the database
 * To run integration tests, you need to run `npm run test:integration` or `yarn test:integration`
 */
describe("Register User", () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should validate password contains letters and numbers and be at least 6 characters", async () => {
    const formData = new FormData();
    formData.append("email", "tests@test.com");
    formData.append("firstName", "test");
    formData.append("lastName", "test");
    formData.append("password", "test");

    const request = new Request("http://localhost", {
      method: "POST",
      body: formData,
    });

    const result = await auth.registerUser(request);
    const resultObject = result as UserDataError;
    expect(resultObject.error.code).toBe("invalid_password");
    expect(resultObject.error.message).toBe(
      "Password must contain letters and numbers and be at least 6 characters long"
    );
  });
});
