import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import StarRating from './Stars';

interface RatingProps {
  rideId: number; 
}

const Rating: React.FC<RatingProps> = ({ rideId }) => {
  const [rating, setRating] = useState<number>(0);  
  const router = useRouter();

  const submitRating = async () => {
    try {
      await axios.post(`/api/rating`, { rideId, rating });
      router.push('/');
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className='relative h-[100vh] text-center space-y-3 mt-[220px] overflow-y-hidden'>
      <h3>Hope you enjoyed your ride!</h3>
      <StarRating rating={rating} setRating={setRating} />
      <button onClick={submitRating} className='py-2 pl-5 pr-5 bg-black text-white rounded-md'>Rate Your Driver</button>
    </div>
  );
};

export default Rating;
