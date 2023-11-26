import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { pickupLocation, dropoffLocation, fare, passengerCount, paymentMethod } = req.body;

      console.log("Booking Data:", req.body);
      res.status(200).json({ message: 'Ride booked successfully!' });
    } catch (error) {
      res.status(500).json({ message: 'Error booking the ride' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
