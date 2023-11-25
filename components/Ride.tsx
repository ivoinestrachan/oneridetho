import GoogleMapReact from "google-map-react";
import { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  useLoadScript,
  GoogleMap,
  Marker,
  Polyline,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { IoMdPerson } from "react-icons/io";
import router from "next/router";

interface MapProps {
  text: string;
  lat: number;
  lng: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

const Map: React.FC<MapProps> = ({ text }) => <div>{text}</div>;

function SimpleMap({ pickupCoordinates, dropoffCoordinates }: { pickupCoordinates: Coordinates | null, dropoffCoordinates: Coordinates | null }) {
  const mapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || ""
});

const [directionsResult, setDirectionsResult] = useState<any | null>(null);

const directionsRendererOptions = {
  polylineOptions: {
    strokeColor: '#FF0000', 
    strokeOpacity: 0.8,
    strokeWeight: 5,
  },
};

useEffect(() => {
  if (pickupCoordinates && dropoffCoordinates) {
    const directionsService = new window.google.maps.DirectionsService();
    
    directionsService.route({
      origin: pickupCoordinates,
      destination: dropoffCoordinates,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirectionsResult(result);
      } else {
        console.error(`Error fetching directions: ${status}`);
        setDirectionsResult(null);
      }
    });
  }
}, [pickupCoordinates, dropoffCoordinates]);



if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="sm:h-[78vh] sm:w-[65%]  h-[100vh] w-[100%] sm:mt-0 mt-5">
    <GoogleMap
           mapContainerStyle={{ width: '100%', height: '100%' }}
       center={{ lat: 25.06, lng: -77.345 }}
       zoom={13}
       options={mapOptions}
      >


{directionsResult && (
  <DirectionsRenderer directions={directionsResult} options={directionsRendererOptions}/>
)}
      </GoogleMap>
    </div>
  );
}

const Ride = () => {
  const [distance, setDistance] = useState<string | null>(null);
  const [passengers, setPassengers] = useState(1);
  const [fare, setFare] = useState("10.00");
  const [pickupClicked, setPickupClicked] = useState(false);

  const [pickupCoordinates, setPickupCoordinates] = useState<Coordinates | null>(null);
  const [dropoffCoordinates, setDropoffCoordinates] = useState<Coordinates | null>(null);

  

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.API_KEY || "",
    libraries: ["places"],
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
    if (!isLoaded) return;

    if (!pickupInputRef.current || !dropoffInputRef.current) {
      return;
    }

    const pickupAutocomplete = new window.google.maps.places.Autocomplete(
      pickupInputRef.current,
      {
        //  types: ["geocode"],
        strictBounds: true,
        componentRestrictions: { country: "BS" },
      }
    );

    const dropoffAutocomplete = new window.google.maps.places.Autocomplete(
      dropoffInputRef.current,
      {
        //types: ["geocode"],
        strictBounds: true,
        componentRestrictions: { country: "BS" },
      }
    );

    pickupAutocomplete.addListener("place_changed", () => {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setPickupCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      }
    });

    dropoffAutocomplete.addListener("place_changed", () => {
      const place = dropoffAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        setDropoffCoordinates({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
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

  return (
    <div className="mt-5 sm:flex justify-between">
      <div className="space-y-4">
        <div className="sm:pt-5 font-bold text-[24px]">Book a Ride</div>
        <div className="flex items-center  justify-between sm:w-[173%] w-[102%] sm:pt-10">
          <div>
            <input
              ref={pickupInputRef}
              placeholder="Pickup Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[190%] w-[150%]"
            />
          </div>
          <div>
            <button className="bg-black text-white rounded-md py-2.5 pr-5 pl-5 text-[20px]">
              +
            </button>
          </div>
        </div>
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
        <div className="flex items-center gap-2">
          <div>
            <button
              className="py-2 bg-black text-white pl-4 pr-4 rounded-md"
              onClick={handlePickupClick}
            >
              Pickup Now
            </button>
          </div>

          <div>
            {pickupClicked && (
              <button
                className="py-2 bg-black text-white pl-4 pr-4 rounded-md"
                onClick={handleBooking}
              >
                Book
              </button>
            )}
          </div>
        </div>
      </div>
      <SimpleMap 
      pickupCoordinates={pickupCoordinates} 
      dropoffCoordinates={dropoffCoordinates} 
      />
    </div>
  );
};
export { SimpleMap, Ride };
