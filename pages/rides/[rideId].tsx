import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Define TypeScript interfaces for your data
interface Driver {
    name: string;
    rating: number;
}

interface Ride {
    pickupLocation: string;
    dropoffLocation: string;
    fare: number;
    driver: Driver;
}

const RideDetails = () => {
    const router = useRouter();
    const { rideId } = router.query;
    

    const [ride, setRide] = useState<Ride | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (rideId) {
            const fetchRideDetails = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get(`/api/rides/${rideId}`);
                    setRide(response.data);
                } catch (error) {
                    console.error('Error fetching ride details:', error);
                    setError('Failed to load ride details.');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchRideDetails();
        }
    }, [rideId]);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Ride Details</h1>
            {ride && (
                <div>
                    <h2>Ride Information</h2>
                    <p>Pickup Location: {ride.pickupLocation}</p>
                    <p>Dropoff Location: {ride.dropoffLocation}</p>
                    <p>Fare: ${ride.fare}</p>
       

                    {ride.driver && (
                        <div>
                            <h2>Driver Information</h2>
                            <p>Name: {ride.driver.name}</p>
                            <p>Rating: {ride.driver.rating}</p>
                           
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RideDetails;
