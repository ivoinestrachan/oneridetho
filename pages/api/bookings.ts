import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from './auth/[...nextauth]'

const prisma = new PrismaClient();


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    res.status(401).json({ message: "You must be logged in." })
    return
  }


    const userId = parseInt(session.user.id);

    try {
      const {
        pickupLocation,
        dropoffLocation,
        fare,
        passengerCount,
        paymentMethod,
      } = req.body;

      const ride = await prisma.ride.create({
        data: {
          pickupTime: new Date(),
          dropoffTime: null,
          fare: parseFloat(fare),
          tip: 5,
          userId,
          driverId: null,
          status: "Requested",
          pickupLocation,
          dropoffLocation,
          passengerCount: parseInt(passengerCount),
          isAccepted: false,
          isConfirmed: false,
          paymentMethod,
        },
      });

      const booking = await prisma.booking.create({
        data: {
          rideId: ride.id,
          userId,
          driverId: null,
          createdAt: new Date(),
          isAccepted: false,
        },
      });

      res.status(200).json({
        message: "Ride booked successfully!",
        bookingId: booking.id,
        rideId: ride.id,
      });
    } catch (error) {
      console.error("Error in booking ride:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}
