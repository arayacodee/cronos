import {
  Request,
  Response
} from "express";

import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE
} from "../lib/session.js";

const googleClient = new OAuth2Client(
  env.GOOGLE_CLIENT_ID
);

const googleLoginSchema = z.object({
  credential: z.string().min(1)
});

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
};

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const parsed =
      googleLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid login data"
      });
    }

    const { credential } = parsed.data;

    const ticket =
      await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID
      });

    const payload = ticket.getPayload();

    if (
      !payload?.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        error: "Invalid Google account"
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = payload.name ?? null;

    let user =
      await prisma.user.findUnique({
        where: {
          googleId
        }
      });

    if (!user) {
      // Las cuentas profesionales prehabilitadas se reconocen por el correo
      // registrado por administración, sin confiar en un rol del cliente.
      const existingByEmail =
        await prisma.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: "insensitive"
            }
          }
        });

      if (existingByEmail) {
        if (
          existingByEmail.googleId &&
          existingByEmail.googleId !== googleId
        ) {
          return res.status(409).json({
            error:
              "This email is already linked to another Google account"
          });
        }

        user = await prisma.user.update({
          where: {
            id: existingByEmail.id
          },

          data: {
            googleId,
            name:
              existingByEmail.name ??
              name
          }
        });
      } else {
        user = await prisma.user.create({
          data: {
            googleId,
            email,
            name,
            role: "CLIENT"
          }
        });
      }
    }

    const sessionToken =
      await createSessionToken(user.id);

    res.cookie(
      SESSION_COOKIE,
      sessionToken,
      cookieOptions
    );

    return res.status(200).json({
      user
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "Google authentication failed:",
      message
    );

    return res.status(401).json({
      error: "Google authentication failed"
    });
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  return res.status(200).json({
    user: req.authUser
  });
};

export const logout = async (
  _req: Request,
  res: Response
) => {
  res.clearCookie(
    SESSION_COOKIE,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        env.NODE_ENV === "production",
      path: "/"
    }
  );

  return res.status(204).send();
};
