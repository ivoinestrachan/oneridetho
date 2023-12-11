import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Image from "next/image";
import { HiMiniStar } from "react-icons/hi2";

interface Driver {
  photoUrl: string;
  name: string;
  rating: number;
  carType: string;
  licensePlate: string;
  carImageUrl: string;
  phone: string;
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
  const [error, setError] = useState("");

  useEffect(() => {
    if (rideId) {
      const fetchRideDetails = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/rides/${rideId}`);
          setRide(response.data);
        } catch (error) {
          console.error("Error fetching ride details:", error);
          setError("Failed to load ride details.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchRideDetails();
    }
  }, [rideId]);

  const cancelRide = async () => {
    try {
      const response = await axios.post(`/api/rides/cancel/${rideId}`);
      alert("Ride has been canceled");
      router.push('/'); 
    } catch (error) {
      console.error("Error cancelling ride:", error);
      setError("Failed to cancel ride.");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="px-2">
      {ride && (
        <div>
          <p>Pickup Location: {ride.pickupLocation}</p>
          <p>Dropoff Location: {ride.dropoffLocation}</p>

          {ride.driver && (
            <div className="bottom-10 absolute">
              <div className="flex items-center">
                <div className="mt-20 rounded-full flex items-center gap-2 ">
                  {ride.driver.rating}{" "}
                  <span>
                    <HiMiniStar />
                  </span>
                </div>
                <Image
                  src={ride.driver.photoUrl}
                  alt="pfp"
                  width={70}
                  height={70}
                  className="rounded-full absolute border-r border-black"
                />
                <Image
                  src={ride.driver.carImageUrl}
                  alt="car"
                  width={225}
                  height={225}
                />
                <div className="ml-[30px]">
                  <p className="text-gray-500 text-[18px]">
                    {ride.driver.name}
                  </p>
                  <p className="font-bold text-[24px]">
                    {ride.driver.licensePlate}
                  </p>
                  <p className="text-gray-500 text-[18px]">
                    {ride.driver.carType}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between w-[98%]">
                <a href={`tel:4155550132`}>
                  <div>Customer Service</div>
                  <p className="underline text-blue-400 text-[18px]">
                  4155550132
                  </p>
                </a>

                <div>
                  <button className="bg-red-500 py-3 pl-2 pr-2 rounded-md text-white"
                   onClick={cancelRide}
                  >Cancel Ride</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RideDetails;
