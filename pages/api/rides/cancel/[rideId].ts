import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const rideId = parseInt(req.query.rideId as string);

    try {
      await prisma.ride.update({
        where: { id: rideId },
        data: { status: 'Cancelled' },
      });

      res.status(200).json({ message: 'Ride cancelled successfully' });
    } catch (error) {
      console.error("Error cancelling ride:", error);
      res.status(500).json({ message: 'Error cancelling ride' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
