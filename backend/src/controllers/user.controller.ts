import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["CLIENT", "PROFESSIONAL"]),
});

export const createUser = async (req: Request, res: Response) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });
  }

  const { email, name, role } = result.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "A user with this email already exists",
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};