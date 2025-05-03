// __tests__/authService.test.js
const { registerUser, loginUser } = require("../services/authService");
const User = require("../models/users");
const bcrypt = require("bcryptjs");

jest.mock("../models/users");
jest.mock("bcryptjs");

describe("Auth Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should throw if user already exists", async () => {
      User.findOne.mockResolvedValue(true);

      await expect(registerUser({ email: "test@example.com" }))
        .rejects.toThrow("User already exists");
    });

    it("should register a new user", async () => {
      User.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPass");
      const saveMock = jest.fn();
      User.mockImplementation(() => ({ save: saveMock }));

      const msg = await registerUser({
        name: "Test",
        email: "test@example.com",
        phone: "123456",
        password: "password123"
      });

      expect(msg).toBe("User registered successfully");
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("should throw if user not found", async () => {
      User.findOne.mockResolvedValue(null);
      await expect(loginUser({ email: "no@user.com", password: "123" }))
        .rejects.toThrow("User not found");
    });

    it("should throw if password is incorrect", async () => {
      User.findOne.mockResolvedValue({ password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      await expect(loginUser({ email: "user@test.com", password: "wrong" }))
        .rejects.toThrow("Invalid credentials");
    });
  });
});
