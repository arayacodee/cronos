import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const createBusinessSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  ownerId: z.string().uuid(),
});

export const createBusiness = async (req: Request, res: Response) => {
  const result = createBusinessSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });
  }

  const { name, description, ownerId } = result.data;

  try {
    const owner = await prisma.user.findUnique({
      where: {
        id: ownerId,
      },
    });

    if (!owner) {
      return res.status(404).json({
        error: "Owner not found",
      });
    }

    if (owner.role !== "PROFESSIONAL") {
      return res.status(403).json({
        error: "Only professional users can create a business",
      });
    }

    const business = await prisma.business.create({
      data: {
        name,
        description,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json(business);
  } catch (error) {
    console.error("Create business error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getBusinesses = async (_req: Request, res: Response) => {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(businesses);
  } catch (error) {
    console.error("Get businesses error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getBusinessById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const business = await prisma.business.findUnique({
      where: {
        id,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        services: true,
        availabilities: true,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    return res.status(200).json(business);
  } catch (error) {
    console.error("Get business error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};