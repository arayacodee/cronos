import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const createReservationSchema = z.object({
  serviceId: z.string().uuid(),
  clientId: z.string().uuid(),
  startsAt: z.string().refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Invalid date"
  ),
});

const weekdayMap: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const getLocalDateParts = (date: Date, timeZone: string) => {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);

  const datePart = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return {
    dayOfWeek: weekdayMap[weekday],
    datePart,
    time,
  };
};

const isPrismaRetryableError = (error: unknown) => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2034"
  );
};

export const createReservation = async (
  req: Request,
  res: Response
) => {
  const result = createReservationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: "Invalid request data",
      details: result.error.flatten(),
    });
  }

  const { serviceId, clientId, startsAt } = result.data;

  const reservationStart = new Date(startsAt);

  if (reservationStart <= new Date()) {
    return res.status(400).json({
      error: "Reservation must be in the future",
    });
  }

  try {
    const service = await prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        business: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        error: "Service not found",
      });
    }

    if (!service.isActive) {
      return res.status(409).json({
        error: "Service is not active",
      });
    }

    const client = await prisma.user.findUnique({
      where: {
        id: clientId,
      },
    });

    if (!client) {
      return res.status(404).json({
        error: "Client not found",
      });
    }

    if (client.role !== "CLIENT") {
      return res.status(403).json({
        error: "Only client users can create reservations",
      });
    }

    const reservationEnd = new Date(
      reservationStart.getTime() + service.durationMin * 60_000
    );

    const timeZone = service.business.timezone;

    const localStart = getLocalDateParts(
      reservationStart,
      timeZone
    );

    const localEnd = getLocalDateParts(
      reservationEnd,
      timeZone
    );

    if (localStart.datePart !== localEnd.datePart) {
      return res.status(409).json({
        error: "Reservation cannot cross into another day",
      });
    }

    const availability = await prisma.availability.findFirst({
      where: {
        businessId: service.businessId,
        dayOfWeek: localStart.dayOfWeek,
        isActive: true,
        startTime: {
          lte: localStart.time,
        },
        endTime: {
          gte: localEnd.time,
        },
      },
    });

    if (!availability) {
      return res.status(409).json({
        error: "Requested time is outside business availability",
      });
    }

    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const reservation = await prisma.$transaction(
          async (tx) => {
            const overlappingReservation =
              await tx.reservation.findFirst({
                where: {
                  businessId: service.businessId,
                  status: {
                    not: "CANCELLED",
                  },
                  startsAt: {
                    lt: reservationEnd,
                  },
                  endsAt: {
                    gt: reservationStart,
                  },
                },
              });

            if (overlappingReservation) {
              return null;
            }

            return tx.reservation.create({
              data: {
                businessId: service.businessId,
                serviceId,
                clientId,
                startsAt: reservationStart,
                endsAt: reservationEnd,
              },
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    durationMin: true,
                    price: true,
                  },
                },
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                business: {
                  select: {
                    id: true,
                    name: true,
                    timezone: true,
                  },
                },
              },
            });
          },
          {
            isolationLevel: "Serializable",
          }
        );

        if (!reservation) {
          return res.status(409).json({
            error: "Requested time overlaps an existing reservation",
          });
        }

        return res.status(201).json(reservation);
      } catch (error) {
        if (
          isPrismaRetryableError(error) &&
          attempt < maxAttempts
        ) {
          continue;
        }

        throw error;
      }
    }

    return res.status(409).json({
      error: "Could not create reservation due to concurrent requests",
    });
  } catch (error) {
    console.error("Create reservation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getReservations = async (
  req: Request,
  res: Response
) => {
  try {
    const businessId =
      typeof req.query.businessId === "string"
        ? req.query.businessId
        : undefined;

    const clientId =
      typeof req.query.clientId === "string"
        ? req.query.clientId
        : undefined;

    const reservations = await prisma.reservation.findMany({
      where: {
        ...(businessId ? { businessId } : {}),
        ...(clientId ? { clientId } : {}),
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            timezone: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            price: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startsAt: "asc",
      },
    });

    return res.status(200).json(reservations);
  } catch (error) {
    console.error("Get reservations error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getReservationById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: {
        id,
      },
      include: {
        business: true,
        service: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      return res.status(404).json({
        error: "Reservation not found",
      });
    }

    return res.status(200).json(reservation);
  } catch (error) {
    console.error("Get reservation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
  
};

export const cancelReservation = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      return res.status(404).json({
        error: "Reservation not found",
      });
    }

    if (reservation.status === "CANCELLED") {
      return res.status(200).json(reservation);
    }

    const cancelledReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });

    return res.status(200).json(cancelledReservation);
  } catch (error) {
    console.error("Cancel reservation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};