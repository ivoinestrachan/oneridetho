import React, { useState, useEffect, useRef, useCallback } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { HiMiniStar } from 'react-icons/hi2';
import Confirmation from '../confirmation';
import {
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
  Marker,
} from '@react-google-maps/api';
import Rating from '@/components/Rating';

const RideDetails = () => {
  const router = useRouter();
  const { rideId } = router.query;
  const { data: ride, error } = useSWR(rideId ? `/api/rides/${rideId}` : null, url => axios.get(url).then(res => res.data));
  const [mapLocation, setMapLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef();
  const driverIconUrl = "https://res.cloudinary.com/dxmrcocqb/image/upload/v1703094607/Haunted_House_Group_kxxb3v.png";



  const driverLocation = { lat: 25.0343, lng: -77.3963 };

  const renderDriverMarker = () => {
    if (typeof google !== "undefined") {
      return (
        <Marker 
          position={driverLocation} 
          icon={{
            url: driverIconUrl,
            scaledSize: new google.maps.Size(50, 50) 
          }}
        />
      );
    }
    return null;
  };

  const geocodeAddress = async (address:string) => {
    try {
      const response = await axios.post('/api/geocode', { address });
      return response.data;
    } catch (error) {
      console.error('Error during geocoding:', error);
      throw error;
    }
  };


  useEffect(() => {
    const fetchLocation = async () => {
      if (ride && ride.status) {
        const location = ride.status === 'InProgress' ? ride.dropoffLocation : ride.pickupLocation;

        if (typeof location === 'object' && 'lat' in location && 'lng' in location) {
          setMapLocation(location);
        } else if (typeof location === 'string') {
          try {
            const coords = await geocodeAddress(location);
            if (coords.lat && coords.lng) {
              setMapLocation(coords);
            } else {
              console.error('Geocoding returned invalid data:', coords);
            }
          } catch (error) {
            console.error('Geocoding error:', error);
          }
        } else {
          console.error('Invalid location data:', location);
        }
      }
    };

    fetchLocation();
  }, [ride]);


  useEffect(() => {
    if (ride && ride.status) {
      const location = ride.status === 'InProgress' ? ride.dropoffLocation : ride.pickupLocation;
      setMapLocation(location);
    }
  }, [ride]);
  

  useEffect(() => {
    if (ride && mapLocation && mapRef.current) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: driverLocation,
        destination: mapLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          //@ts-ignore
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      });
    }
  }, [ride, mapLocation]);

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '90vh',
  };

  const mapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: false,
  };
    const cancelRide = async () => {
    try {
      await axios.post(`/api/rides/cancel/${rideId}`);
      alert("Ride has been canceled");
      router.push('/'); 
    } catch (cancelError) {
      console.error("Error cancelling ride:", cancelError);
    }
  };




  if (!ride && !error) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  if (ride?.status === 'Completed') {
    return <Rating rideId={ride.id} />;
  }

  return (
    <div className='relative'>

      {ride ? (
        ride.driver ? (
          <div>
            <div className="bottom-0 absolute z-10 bg-white py-2 px-2 rounded-t-[12px]">
              <div className="flex items-center">
                <div className="mt-20 rounded-full flex items-center gap-2">
                  {ride.driver.rating} <span><HiMiniStar /></span>
                </div>
                <Image src={ride.driver.photoUrl || "https://res.cloudinary.com/dxmrcocqb/image/upload/v1700749220/Social_Media_Chatting_Online_Blank_Profile_Picture_Head_And_Body_Icon_People_Standing_Icon_Grey_Background_generated_qnojdz.jpg"} alt="driver" width={70} height={70} className="rounded-full absolute border-r border-black" />
                <Image src={ride.driver.carImageUrl} alt="car" width={225} height={225} />
                <div className="ml-[30px]">
                  <p className="text-gray-500 text-[18px]">{ride.driver.name}</p>
                  <p className="font-bold text-[24px]">{ride.driver.licensePlate}</p>
                  <p className="text-gray-500 text-[18px]">{ride.driver.carType}</p>
                </div>
              </div>
              <div className="flex items-center justify-between w-[98%]">
                <a href={"tel:12428221495"}>
                  <div>Customer Service</div>
                  <p className="underline text-blue-400 text-[18px]">822-1495</p>
                </a>
                <div>
                  <button className="bg-red-500 py-3 pl-2 pr-2 rounded-md text-white" onClick={cancelRide}>Cancel Ride</button>
                </div>
              </div>
            </div>
            {mapLocation && (
        <LoadScript googleMapsApiKey={process.env.API_KEY || ""}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapLocation}
            zoom={15}
            onLoad={onMapLoad}
            options={mapOptions}
          >
            {renderDriverMarker()}
            <Marker position={mapLocation} label={ride.status === 'InProgress' ? "Dropoff" : "Pickup"} />
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </LoadScript>
      )}
          </div>
        ) : (
          <Confirmation />
        )
      ) : (
        <p>No ride details available.</p>
      )}
   
    </div>
  );
};

export default RideDetails;
