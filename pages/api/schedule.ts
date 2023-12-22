import prisma from "@/lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method === "POST") {
      const {
        userId,
        pickupLocation,
        dropoffLocation,
        scheduledPickupTime,
        fare,
        passengerCount,
        paymentMethod,
      } = req.body;
  
      const parsedUserId = parseInt(userId);
  
      if (
        isNaN(parsedUserId) ||
        !pickupLocation ||
        !dropoffLocation ||
        !scheduledPickupTime
      ) {
        return res.status(400).send("Missing or invalid required fields");
      }
  
      try {
        const scheduledRide = await prisma.ride.create({
          data: {
            userId: parsedUserId, 
            pickupLocation,
            dropoffLocation,
            fare: parseFloat(fare),
            passengerCount: parseInt(passengerCount),
            paymentMethod,
            pickupTime: new Date(scheduledPickupTime),
            dropoffTime: null,
            driverId: null,
            isScheduled: true,
            status: "Scheduled",
            isConfirmed: false,
          },
        });
  
        res.status(200).json(scheduledRide);
      } catch (error) {
        console.error("Error scheduling ride:", error);
        res.status(500).send("Error scheduling ride");
      }
    } else {
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }
  