import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    /*
    const session = await getSession({ req });

    if (!session || !session.user || !session.user.id) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    */
    const userId = 24 /*parseInt(session.user.id)*/;

    try {
      const {
        pickupLocation,
        dropoffLocation,
        fare,
        passengerCount,
        paymentMethod,
      } = req.body;

      console.log("Request Body:", {
        pickupLocation,
        dropoffLocation,
        fare,
        passengerCount,
        paymentMethod,
      });

      const ride = await prisma.ride.create({
        data: {
          pickupTime: new Date(),
          dropoffTime: null,
          fare: parseFloat(fare),
          tip: 5,
          userId: userId,
          driverId: null as number | null,
          status: "Requested",
          pickupLocation: pickupLocation,
          dropoffLocation: dropoffLocation,
          passengerCount: parseInt(passengerCount),
          isAccepted: false,
          isConfirmed: false,
          paymentMethod: paymentMethod,
        },
      });

      const booking = await prisma.booking.create({
        data: {
          rideId: ride.id,
          userId: userId,
          driverId: null as number | null,
          createdAt: new Date(),
          isAccepted: false,
        },
      });

      console.log("Booking Data:", booking);
      res.status(200).json({
        message: "Ride booked successfully!",
        bookingId: booking.id,
        rideId: ride.id,
      });
    } catch (error: unknown) {
      let errorMessage = "Error booking the ride";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Error:", errorMessage);
      res.status(500).json({ message: errorMessage });
    }
  } else {
    console.log(`Method ${req.method} not allowed`);
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
