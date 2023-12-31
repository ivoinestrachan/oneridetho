import { useEffect, useRef, useState } from "react";
import {
  useLoadScript,
  GoogleMap,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { IoMdPerson } from "react-icons/io";
import router from "next/router";
import Link from "next/link";

interface Coordinates {
  lat: number;
  lng: number;
}

const Estimate = () => {
  const [distance, setDistance] = useState<string | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState("");
  const [pickupClicked, setPickupClicked] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const [pickupCoordinates, setPickupCoordinates] =
    useState<Coordinates | null>(null);
  const [dropoffCoordinates, setDropoffCoordinates] =
    useState<Coordinates | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places", "geocoding"],
  });

  const handlePickupClick = () => {
    handleCalculateDistance();
    setPickupClicked(true);
  };

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const calculateFare = (distance: number, passengers: number): string => {
    const baseFare = 10;
    const distanceCharge = distance * 2;
    const passengerCharge = (passengers - 1) * 2;

    const currentHour = new Date().getHours();

    const isNightFee = currentHour >= 23 || currentHour < 6;

    const nightgFee = isNightFee ? 5 : 0;

    const totalFare = baseFare + distanceCharge + passengerCharge + nightgFee;

    return totalFare.toFixed(2);
  };

  useEffect(() => {
    if (distance) {
      setFare(calculateFare(parseFloat(distance), passengers));
    }
  }, [passengers]);

  const handleCalculateDistance = () => {
    if (pickupInputRef.current && dropoffInputRef.current) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [pickupInputRef.current.value],
          destinations: [dropoffInputRef.current.value],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK" && response) {
            const distanceInMiles =
              response.rows[0].elements[0].distance.value / 1609.34;
            setFare(calculateFare(distanceInMiles, passengers));
          } else {
            console.error("Error was: " + status);
          }
        }
      );
    }
  };

  const handleBooking = () => {
    const pickupLocation = pickupInputRef.current?.value;
    const dropoffLocation = dropoffInputRef.current?.value;

    if (pickupLocation && dropoffLocation) {
      localStorage.setItem(
        "rideDetails",
        JSON.stringify({
          pickup: pickupLocation,
          dropoff: dropoffLocation,
          fare: fare,
          passengers: passengers,
        })
      );

      router.push({
        pathname: "/checkout",
        query: {
          pickup: pickupLocation,
          dropoff: dropoffLocation,
          fare: fare,
          passengers: passengers,
        },
      });
    }
  };

  useEffect(() => {
    if (!isLoaded || !pickupInputRef.current || !dropoffInputRef.current) {
      console.error("Google Maps JavaScript API not loaded or error occurred");
      return;
    }

    const pickupAutocomplete = new window.google.maps.places.Autocomplete(
      pickupInputRef.current,
      {
        strictBounds: true,
        componentRestrictions: { country: "BS" },
      }
    );

    const dropoffAutocomplete = new window.google.maps.places.Autocomplete(
      dropoffInputRef.current,
      {
        strictBounds: true,
        componentRestrictions: { country: "BS" },
      }
    );

    pickupAutocomplete.addListener("place_changed", () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setPickupCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    dropoffAutocomplete.addListener("place_changed", () => {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setDropoffCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });

    return () => {
      window.google.maps.event.clearInstanceListeners(pickupAutocomplete);
      window.google.maps.event.clearInstanceListeners(dropoffAutocomplete);
    };
  }, [isLoaded]);

  useEffect(() => {
    if (router.query.editing) {
      const savedDetails = localStorage.getItem("rideDetails");
      if (savedDetails) {
        const details = JSON.parse(savedDetails);
        if (details.pickup && pickupInputRef.current)
          pickupInputRef.current.value = details.pickup;
        if (details.dropoff && dropoffInputRef.current)
          dropoffInputRef.current.value = details.dropoff;
        if (details.fare) setFare(details.fare);
        if (details.passengers) setPassengers(details.passengers);
      }
    } else {
      localStorage.removeItem("rideDetails");
    }
  }, []);

  const reverseGeocode = (coordinates: Coordinates): Promise<string> => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: coordinates }, (results, status) => {
        if (status === "OK") {
          if (results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error("No results found"));
          }
        } else {
          reject(new Error("Geocoder failed due to: " + status));
        }
      });
    });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(currentLocation);
          setPickupCoordinates(currentLocation);
          try {
            const address = await reverseGeocode(currentLocation);
            if (pickupInputRef.current) {
              pickupInputRef.current.value = address;
            }
          } catch (error) {
            console.error("Error getting address:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const clearPickupInput = () => {
    if (pickupInputRef.current) {
      pickupInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-gray-100 sm:pr-[100px] sm:pl-[40px] py-4 pl-3 pr-3 rounded-md shadow-xl">
      <div className="space-y-4">
        <div className="sm:pt-5 font-bold text-[24px]">Book a Ride</div>
        <button onClick={getUserLocation}>Use Current Location</button>
        <div className="flex items-center  justify-between  ">
          <div className="sm:blcok flex items-center sm:w-[370px] w-[500px]">
            <input
              ref={pickupInputRef}
              placeholder="Pickup Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[200%] w-[190%]"
            />

            <button
              onClick={clearPickupInput}
              className="absolute sm:hidden block ml-[80vw] bg-white pl-3 pr-3 rounded-full py-1"
            >
              X
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <div>
            <input
              ref={dropoffInputRef}
              placeholder="Dropoff Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[200%] w-[190%]"
            />
          </div>
        </div>
        <div className="flex items-center border border-gray-200 rounded-md py-2 pl-3 justify-between sm:w-[100%] w-[95%]">
          <div>Fare: ${fare}</div>
          <div className="flex items-center gap-2 w-[26%]">
            <div>
              <IoMdPerson size={24} />
            </div>
            <div>
              <input
                type="number"
                className="border-black border-2 rounded-[4px] w-[40px] py-1 outline-none text-center"
                value={passengers}
                onChange={(e) => {
                  const newPassengerCount = Math.max(1, Math.min(4, parseInt(e.target.value)));
                  setPassengers(newPassengerCount);
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div>
            <button
              className="py-2 bg-black text-white pl-4 pr-4 rounded-md"
              onClick={handlePickupClick}
            >
              See Prices
            </button>
          </div>
          <div>
            {pickupClicked && (
              <Link href="/book">
              <button
           
                className="py-2.5 bg-black text-white pl-4 pr-4 rounded-md"
              >
                Book Now
              </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export { Estimate };
