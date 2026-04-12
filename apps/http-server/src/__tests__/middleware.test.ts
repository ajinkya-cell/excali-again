import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { Middleware } from "../middleware";

const JWT_SECRET = "test-secret-key";

function mockReq(token?: string) {
  return {
    headers: {
      authorization: token ?? "",
    },
    userid: undefined as number | undefined,
  } as any;
}

function mockRes() {
  const res: any = {
    statusCode: 200,
    body: null,
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((data: any) => {
    res.body = data;
    return res;
  });
  return res;
}

describe("Middleware", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  it("calls next() and sets userid for a valid token", () => {
    const token = jwt.sign({ id: 42 }, JWT_SECRET);
    const req = mockReq(token);
    const res = mockRes();
    const next = vi.fn();

    Middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userid).toBe(42);
  });

  it("returns 403 when no token is provided", () => {
    const req = mockReq("");
    const res = mockRes();
    const next = vi.fn();

    Middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({ msg: "login first" });
  });

  it("returns 403 for an invalid token", () => {
    const req = mockReq("invalid.token.here");
    const res = mockRes();
    const next = vi.fn();

    Middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({ msg: "incorrect token" });
  });

  it("returns 403 for a token signed with the wrong secret", () => {
    const token = jwt.sign({ id: 1 }, "wrong-secret");
    const req = mockReq(token);
    const res = mockRes();
    const next = vi.fn();

    Middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.body).toEqual({ msg: "incorrect token" });
  });
});
