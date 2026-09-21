import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

const createAvailabilitySchema = z.object({
  businessId: z.string().uuid(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  isActive: z.boolean().optional(),
});

export const createAvailability = async (
  req: Request,
  res: Response
) => {
  const result = createAvailabilitySchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });
  }

  const {
    businessId,
    dayOfWeek,
    startTime,
    endTime,
    isActive,
  } = result.data;

  if (startTime >= endTime) {
    return res.status(400).json({
      error: "startTime must be earlier than endTime",
    });
  }

  try {
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
      },
    });

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    const overlappingAvailability =
      await prisma.availability.findFirst({
        where: {
          businessId,
          dayOfWeek,
          isActive: true,
          startTime: {
            lt: endTime,
          },
          endTime: {
            gt: startTime,
          },
        },
      });

    if (overlappingAvailability) {
      return res.status(409).json({
        error: "Availability overlaps an existing time block",
      });
    }

    const availability = await prisma.availability.create({
      data: {
        businessId,
        dayOfWeek,
        startTime,
        endTime,
        isActive: isActive ?? true,
      },
    });

    return res.status(201).json(availability);
  } catch (error) {
    console.error("Create availability error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAvailabilities = async (
  req: Request,
  res: Response
) => {
  try {
    const businessId =
      typeof req.query.businessId === "string"
        ? req.query.businessId
        : undefined;

    const availabilities = await prisma.availability.findMany({
      where: businessId
        ? {
            businessId,
          }
        : undefined,
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          dayOfWeek: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    return res.status(200).json(availabilities);
  } catch (error) {
    console.error("Get availabilities error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAvailabilityById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const availability = await prisma.availability.findUnique({
      where: {
        id,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!availability) {
      return res.status(404).json({
        error: "Availability not found",
      });
    }

    return res.status(200).json(availability);
  } catch (error) {
    console.error("Get availability error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const deleteAvailability = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const availability = await prisma.availability.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!availability) {
      return res.status(404).json({
        error: "Availability not found",
      });
    }

    await prisma.availability.delete({
      where: {
        id: req.params.id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete availability error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};