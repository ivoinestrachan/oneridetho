import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from './auth/[...nextauth]';
import twilio from 'twilio';

const prisma = new PrismaClient();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }

  const userId = parseInt(session.user.id);

  try {
    const { pickupLocation, dropoffLocation, fare, passengerCount, paymentMethod, phoneNumbers } = req.body;

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

    /*
    const driverNumbers = ['12424251480']

    for (const number of driverNumbers) {
        try {
            const message = await twilioClient.messages.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                body: `Ride booked!\nPickup: ${pickupLocation},\nDrop-off: ${dropoffLocation}\nPassengers: ${passengerCount}`,
                to: number 
            });
            console.log(`Message sent to ${number}: ${message.sid}`);
        } catch (error) {
            console.error(`Failed to send message to ${number}: ${error}`);
        }
    }
    
    */

        
    res.status(200).json({
      message: "Ride booked successfully!",
      bookingId: booking.id,
      rideId: ride.id,
    });
  } catch (error) {
    console.error("Error in booking ride:", error);
  }
}
