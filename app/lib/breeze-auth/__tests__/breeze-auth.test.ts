import { BreezeAuth } from "../breeze-auth";
import { BreezeAuthSessionUser } from "../types";

const testUser = {
  id: "test",
  email: "test@email.com",
  firstName: "Test",
  lastName: "User",
  emailVerified: true,
  avatar: null,
  roles: ["user"],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("BreezeAuth", () => {
  let breezeAuth: BreezeAuth<BreezeAuthSessionUser>;

  const dbAdapterMock = {
    registerUser: vi.fn(),
    resetUserPassword: vi.fn(),
    deletePasswordResetToken: vi.fn(),
    changeUserPassword: vi.fn(),
    getUserByEmail: vi.fn(),
    generatePasswordResetToken: vi.fn(),
    validatePasswordResetToken: vi.fn(),
    verifyEmail: vi.fn(),
    loginUser: vi.fn(),
    generateEmailVerificationToken: vi.fn(),
  };

  const breezeAuthOptions = {
    databaseAdapter: dbAdapterMock,
    cookie: {
      secret: "testsecret",
      name: "testcookie",
    },
  };

  beforeEach(() => {
    breezeAuth = new BreezeAuth(breezeAuthOptions);
    const provider = { type: "credentials" as const };
    breezeAuth.use(provider);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return true for valid email addresses", () => {
    expect(breezeAuth.validateEmail("test@example.com")).toBe(true);
  });

  it("should return false for invalid email addresses", () => {
    expect(breezeAuth.validateEmail("test")).toBe(false);
  });

  it("should add a provider to the providers array", () => {
    const provider = { type: "credentials" as const };
    breezeAuth.use(provider);
    expect(breezeAuth.getProviders()).toContain(provider);
  });

  it("should register user and return the user object successfully", async () => {
    const provider = { type: "credentials" as const };
    breezeAuth.use(provider);

    dbAdapterMock.registerUser.mockResolvedValueOnce({
      user: testUser,
      error: null,
    });

    const request = new Request("http://localhost:3000", {
      headers: new Headers({ cookie: "testcookie=testcookie" }),
    });

    const registration = await breezeAuth.registerUser(request);

    expect(registration.user).toEqual(testUser);
    expect(registration.error).toBeNull();
  });

  it("should return an error if registration fails", async () => {
    const provider = { type: "credentials" as const };
    breezeAuth.use(provider);

    dbAdapterMock.registerUser.mockResolvedValueOnce({
      user: null,
      error: { code: "invalid_email", message: "Invalid email" },
    });

    const request = new Request("http://localhost:3000", {
      headers: new Headers({ cookie: "testcookie=testcookie" }),
    });

    const registration = await breezeAuth.registerUser(request);

    expect(registration.user).toBeNull();
    expect(registration.error?.code).toEqual("invalid_email");
  });

  it("should throw if no provider is configured", async () => {
    breezeAuth = new BreezeAuth(breezeAuthOptions);
    const request = new Request("http://localhost:3000", {
      headers: new Headers({ cookie: "testcookie=testcookie" }),
    });
    await expect(breezeAuth.registerUser(request)).rejects.toThrow(
      "BreezeAuth: No credentials provider found in the configuration"
    );
  });

  it("should redirect if 'authenticateAndRedirectTo' option is provided", async () => {
    breezeAuth = new BreezeAuth(breezeAuthOptions);
    const provider = { type: "credentials" as const };
    breezeAuth.use(provider);

    dbAdapterMock.registerUser.mockResolvedValueOnce({
      user: testUser,
      error: null,
    });

    const request = new Request("http://localhost:3000", {
      headers: new Headers({ cookie: "testcookie=testcookie" }),
    });

    const authenticateAndRedirectTo = "/account";

    const response = await breezeAuth.registerUser(request, {
      authenticateAndRedirectTo,
    });

    expect(response.status).toEqual(302);
    expect(response.headers.get("Location")).toEqual(authenticateAndRedirectTo);
  });
});
