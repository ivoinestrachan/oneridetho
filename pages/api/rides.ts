import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler( req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const rides = await prisma.ride.findMany({
        include: {
          user: true,
        },
      });

      res.status(200).json(rides);
    } catch (error) {
      console.error('Request error', error);
      res.status(500).json({ error: 'Error fetching rides' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
