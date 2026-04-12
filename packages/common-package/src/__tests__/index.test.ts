import { describe, it, expect } from "vitest";
import { CreateUserSchema, SiginSchema, CreateRoomSchema } from "../index";

// ---------------------------------------------------------------------------
// CreateUserSchema
// ---------------------------------------------------------------------------
describe("CreateUserSchema", () => {
  it("accepts valid input", () => {
    const result = CreateUserSchema.safeParse({
      username: "testuser",
      password: "securepass",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects username shorter than 5 characters", () => {
    const result = CreateUserSchema.safeParse({
      username: "ab",
      password: "securepass",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username longer than 30 characters", () => {
    const result = CreateUserSchema.safeParse({
      username: "a".repeat(31),
      password: "securepass",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 5 characters", () => {
    const result = CreateUserSchema.safeParse({
      username: "testuser",
      password: "ab",
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password longer than 30 characters", () => {
    const result = CreateUserSchema.safeParse({
      username: "testuser",
      password: "a".repeat(31),
      email: "test@example.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email shorter than 5 characters", () => {
    const result = CreateUserSchema.safeParse({
      username: "testuser",
      password: "securepass",
      email: "a@b",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = CreateUserSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts boundary length values (5 chars each)", () => {
    const result = CreateUserSchema.safeParse({
      username: "abcde",
      password: "abcde",
      email: "abcde",
    });
    expect(result.success).toBe(true);
  });

  it("accepts boundary length values (30 chars each)", () => {
    const result = CreateUserSchema.safeParse({
      username: "a".repeat(30),
      password: "a".repeat(30),
      email: "a".repeat(30),
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SiginSchema
// ---------------------------------------------------------------------------
describe("SiginSchema", () => {
  it("accepts valid input", () => {
    const result = SiginSchema.safeParse({
      email: "test@example.com",
      password: "securepass",
    });
    expect(result.success).toBe(true);
  });

  it("rejects email shorter than 5 characters", () => {
    const result = SiginSchema.safeParse({
      email: "a@b",
      password: "securepass",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 5 characters", () => {
    const result = SiginSchema.safeParse({
      email: "test@example.com",
      password: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(SiginSchema.safeParse({}).success).toBe(false);
    expect(SiginSchema.safeParse({ email: "test@example.com" }).success).toBe(false);
    expect(SiginSchema.safeParse({ password: "securepass" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// CreateRoomSchema
// ---------------------------------------------------------------------------
describe("CreateRoomSchema", () => {
  it("accepts valid room name", () => {
    const result = CreateRoomSchema.safeParse({ name: "my-room" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CreateRoomSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 20 characters", () => {
    const result = CreateRoomSchema.safeParse({ name: "a".repeat(21) });
    expect(result.success).toBe(false);
  });

  it("accepts boundary length values", () => {
    expect(CreateRoomSchema.safeParse({ name: "a" }).success).toBe(true);
    expect(CreateRoomSchema.safeParse({ name: "a".repeat(20) }).success).toBe(true);
  });

  it("rejects missing name field", () => {
    const result = CreateRoomSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
