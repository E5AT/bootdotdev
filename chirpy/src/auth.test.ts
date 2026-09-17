import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Authentication", () => {
  const secret = "super-secret-key";
  const wrongSecret = "wrong-secret-key";
  const userId = "123e4567-e89b-12d3-a456-426614174000";

  it("should create and validate a valid JWT", () => {
    const token = makeJWT(userId, 3600, secret);
    const sub = validateJWT(token, secret);
    expect(sub).toBe(userId);
  });

  it("should reject an expired JWT", () => {
    // Negative expiration means it's already expired
    const token = makeJWT(userId, -10, secret);
    expect(() => validateJWT(token, secret)).toThrow();
  });

  it("should reject a JWT signed with the wrong secret", () => {
    const token = makeJWT(userId, 3600, secret);
    expect(() => validateJWT(token, wrongSecret)).toThrow();
  });
});