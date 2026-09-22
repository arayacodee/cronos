import {
  SignJWT,
  jwtVerify
} from "jose";

import { env } from "../config/env.js";

const secret = new TextEncoder().encode(
  env.AUTH_SECRET
);

export const SESSION_COOKIE = "cronos_session";

export interface SessionPayload {
  userId: string;
}

export async function createSessionToken(
  userId: string
): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({
      alg: "HS256"
    })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload> {
  const { payload } = await jwtVerify(
    token,
    secret
  );

  if (!payload.sub) {
    throw new Error(
      "Invalid session token"
    );
  }

  return {
    userId: payload.sub
  };
}