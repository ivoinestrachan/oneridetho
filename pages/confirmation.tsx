import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Confirmation = () => {
    const [timeLeft, setTimeLeft] = useState(300);
    const router = useRouter();
    const { rideId } = router.query; 

    let statusCheckInterval: ReturnType<typeof setInterval>;
    
    const checkRideStatus = async () => {
        if (!rideId) return;

        try {
            const response = await axios.get(`/api/rides/${rideId}`);
            if (response.data.isAccepted) {
                clearInterval(statusCheckInterval);
                router.push(`/rides/${rideId}`); 
            }
        } catch (error) {
            console.error('Error checking ride status:', error);
        }
    };

    useEffect(() => {
        if (timeLeft === 0) {
            checkRideStatus();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        const statusCheckInterval = setInterval(checkRideStatus, 5000); 

        return () => {
            clearInterval(intervalId);
            clearInterval(statusCheckInterval);
        };
    }, [timeLeft, rideId]);

    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    const timeUpMessage = timeLeft === 0 ? "We're still looking for your driver. Please hold on a moment longer." : `Estimated time to match you with a driver: ${formatTime()}`;

    return (
        <div className='text-center mt-[35vh]'>
            <h1>Your ride is confirmed. {timeUpMessage}</h1>
            <p>We appreciate your patience. You'll be notified as soon as a driver is matched to your ride.</p>
        </div>
    );
}

export default Confirmation;
