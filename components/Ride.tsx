import { useEffect, useRef, useState } from "react";
import {
  useLoadScript,
  GoogleMap,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { IoMdPerson } from "react-icons/io";
import router from "next/router";
import { useSession } from "next-auth/react";

interface Coordinates {
  lat: number;
  lng: number;
}

function SimpleMap({
  pickupCoordinates,
  dropoffCoordinates,
  stops,
}: {
  pickupCoordinates: Coordinates | null;
  dropoffCoordinates: Coordinates | null;
  stops: Coordinates[];
}) {
  const mapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places", "geocoding"],
  });

  const [directionsResult, setDirectionsResult] = useState<any | null>(null);

  const directionsRendererOptions = {
    polylineOptions: {
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 5,
    },
  };

  useEffect(() => {
    if (pickupCoordinates && dropoffCoordinates) {
      const directionsService = new window.google.maps.DirectionsService();

      const waypoints = stops.map(stop => ({
        location: new window.google.maps.LatLng(stop.lat, stop.lng),
        stopover: true
      }));

      const request = {
        origin: pickupCoordinates,
        destination: dropoffCoordinates,
        waypoints: waypoints,
        optimizeWaypoints: true, 
        travelMode: window.google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResult(result);
        } else {
          console.error(`Error fetching directions: ${status}`);
          setDirectionsResult(null);
        }
      });
    }
  }, [pickupCoordinates, dropoffCoordinates, stops]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="sm:h-[78vh] sm:w-[65%] h-full w-full sm:relative fixed top-0 left-0 sm:z-[1] z-[-1]">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={{ lat: 25.06, lng: -77.345 }}
        zoom={13}
        options={mapOptions}
      >
        {directionsResult && (
          <DirectionsRenderer
            directions={directionsResult}
            options={directionsRendererOptions}
          />
        )}
      </GoogleMap>
    </div>
  );
}

const Ride = () => {
  const [distance, setDistance] = useState<string | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState("");
  const [pickupClicked, setPickupClicked] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [scheduledPickupTime, setScheduledPickupTime] = useState("");
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [stops, setStops] = useState<Coordinates[]>([]);
  const stopInputRefs = useRef<HTMLInputElement[]>([]);

  const addStop = () => {
    if (stops.length < 3) {
      setStops([...stops, { lat: 0, lng: 0 }]);
    } else {
      alert("You can add up to 3 stops only.");
    }
  };

  const handleScheduleClick = () => {
    setShowScheduleInput(true);
  };
  
  

  const [pickupCoordinates, setPickupCoordinates] =
    useState<Coordinates | null>(null);
  const [dropoffCoordinates, setDropoffCoordinates] =
    useState<Coordinates | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places"],
  });

  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const calculateFare = (distance: number, passengers: number, stops: number): string => {
    const baseFare = 9;
    const distanceCharge = distance * 2;
    const passengerCharge = (passengers - 1) * 2;
    const stopCharge = stops * 5; 

    const currentHour = new Date().getHours();
    const isNightFee = currentHour >= 23 || currentHour < 6;
    const nightFee = isNightFee ? 5 : 0;

    const totalFare = baseFare + distanceCharge + passengerCharge + nightFee + stopCharge;
    return totalFare.toFixed(2);
  };

  useEffect(() => {
    if (distance) {
      setFare(calculateFare(parseFloat(distance), passengers, stops.length));
    }
  }, [passengers, stops.length, distance]);

  const handleCalculateDistance = async () => {
    if (!pickupCoordinates || !dropoffCoordinates || stops.some(stop => !stop.lat || !stop.lng)) {
      console.error("Invalid coordinates for calculation");
      return;
    }
  
    const directionsService = new window.google.maps.DirectionsService();
  
    const waypoints = stops.map(stop => ({
      location: new window.google.maps.LatLng(stop.lat, stop.lng),
      stopover: true
    }));
  
    const request = {
      origin: new window.google.maps.LatLng(pickupCoordinates.lat, pickupCoordinates.lng),
      destination: new window.google.maps.LatLng(dropoffCoordinates.lat, dropoffCoordinates.lng),
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    };
  
    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        //@ts-ignore
        const route = result.routes[0];
        let totalDistance = 0;
  
        route.legs.forEach(leg => {
          if (leg.distance) { 
            totalDistance += leg.distance.value;
          }
        });
  
        const distanceInMiles = totalDistance / 1609.34; 
        setDistance(distanceInMiles.toFixed(2));
        setFare(calculateFare(distanceInMiles, passengers, stops.length));
      } else {
        console.error("Error calculating route:", status);
      }
    });
  };
  
  
  

  useEffect(() => {
    handleCalculateDistance();
  }, [pickupCoordinates, dropoffCoordinates, passengers, stops, stops.length]);

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
          stops,
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
          stops: encodeURIComponent(JSON.stringify(stops))
        },
      });
    }
  };

  const { data: session } = useSession();

  const handleScheduleForLater = async () => {
    if (!pickupCoordinates || !dropoffCoordinates || !scheduledPickupTime) {
      alert("Please fill in all fields");
      return;
    }

    const rideDetails = {
      userId: session?.user.id,
      pickupLocation: pickupInputRef.current?.value,
      dropoffLocation: dropoffInputRef.current?.value,
      scheduledPickupTime,
      fare: fare,
      passengerCount: passengers,
      paymentMethod: "Cash",
    };

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rideDetails),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Scheduled ride successfully:", data);
        alert("Ride scheduled successfully!");
        router.push("/");
      } else {
        console.error("Failed to schedule ride:", await response.text());
      }
    } catch (error) {
      console.error("Error during scheduling:", error);
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

  useEffect(() => {
    if (!isLoaded) return;
  
    stopInputRefs.current.forEach((ref, index) => {
      if (!ref) return;
  
      const autocomplete = new window.google.maps.places.Autocomplete(ref, {
        componentRestrictions: { country: "BS" },
      });
  
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const updatedStops = [...stops];
          updatedStops[index] = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setStops(updatedStops);
        }
      });
    });
  }, [isLoaded, stops.length]);
  
  
  const assignRef = (element: HTMLInputElement | null, index: number) => {
    if (element) {
      stopInputRefs.current[index] = element;
    } else {
      stopInputRefs.current.splice(index, 1);
    }
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

  return (
    <div className="mt-5 sm:flex justify-between sm:bg-none bg-white sm:py-0 py-4 sm:pl-0 sm:pr-0 pl-3 pr-3 rounded-md sm:relative sm:top-0 relative top-[390px]">
      <div className="space-y-4">
        <div className="sm:pt-5 font-bold text-[24px]">Book a Ride</div>
        <button onClick={getUserLocation}>Use Current Location</button>
        <div className="flex items-center  justify-between sm:w-[173%] w-[103%] sm:pt-10">
          <div>
            <input
              ref={pickupInputRef}
              placeholder="Pickup Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[190%] w-[150%]"
            />
          </div>
          <div>
            <button onClick={addStop}  className="bg-black text-white rounded-md py-2.5 pr-5 pl-5 text-[20px]">
              +
            </button>
          </div>
        </div>
        {stops.map((stop, index) => (
  <div key={index}>
    <input
      ref={el => assignRef(el, index)}
      type="text"
      placeholder={`Stop ${index + 1}`}
      className="outline-none bg-gray-200 py-3 pl-2 rounded-md sm:w-[150%] w-[90%]"
    />
  </div>
))}
        <div className="flex items-center">
          <div>
            <input
              ref={dropoffInputRef}
              placeholder="Dropoff Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[190%] w-[150%]"
            />
          </div>
        </div>
        <div className="flex items-center border border-gray-200 rounded-md py-2 pl-3 justify-between sm:w-[150%] w-[95%]">
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
                onChange={(e) =>
                  setPassengers(Math.max(1, parseInt(e.target.value)))
                }
              />
            </div>
          </div>
        </div>
        {pickupCoordinates && dropoffCoordinates && fare && (
          <div className="flex items-center gap-2">
            <div>
              <button
                onClick={handleBooking}
                className="py-2.5 bg-black text-white pl-4 pr-4 rounded-md"
              >
                Book Now
              </button>
            </div>
            <button
              className="py-2.5 bg-black text-white pl-4 pr-4 rounded-md"
              onClick={handleScheduleClick}
            >
              Schedule for Later
            </button>
          </div>
        )}
        {showScheduleInput && (
  <div>
    <input
      type="datetime-local"
      value={scheduledPickupTime}
      onChange={(e) => setScheduledPickupTime(e.target.value)}
      className="outline-none bg-gray-200 py-3 pl-2 rounded-md"
    />
    <button onClick={handleScheduleForLater} className="py-2.5 bg-black text-white pl-4 pr-4 rounded-md ml-2 mt-2">
      Confirm
    </button>
  </div>
)}

      </div>
      <SimpleMap
        pickupCoordinates={pickupCoordinates}
        dropoffCoordinates={dropoffCoordinates}
        stops={stops}
      />
    </div>
  );
};
export { SimpleMap, Ride };
