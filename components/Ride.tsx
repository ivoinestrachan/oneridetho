import GoogleMapReact from "google-map-react";
import Autocomplete from "react-google-autocomplete";

interface MapProps {
  text: string;
  lat: number;
  lng: number;
}

const Map: React.FC<MapProps> = ({ text }) => <div>{text}</div>;

function SimpleMap() {
  const defaultProps = {
    center: {
      lat: 25.06,
      lng: -77.345,
    },
    zoom: 13,
  };
  const mapOptions = {
    fullscreenControl: false,
  };

  return (
    <div className="sm:h-[78vh] sm:w-[65%]  h-[100vh] w-[100%] sm:mt-0 mt-5">
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.API_KEY || "" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        options={mapOptions}
        yesIWantToUseGoogleMapApiInternals
      >
        <Map lat={59.955413} lng={30.337844} text="My Marker" />
      </GoogleMapReact>
    </div>
  );
}

const Ride = () => {
  const onPlaceSelected = (place: any, inputRef: string) => {
    console.log(place);
  };

  return (
    <div className="mt-5 sm:flex justify-between">
      <div className="space-y-4">
        <div className="sm:pt-5 font-bold text-[24px]">Book a Ride</div>
        <div className="flex items-center  justify-between sm:w-[173%] w-[97%] sm:pt-10">
          <div>
            <Autocomplete
              placeholder="Pickup Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[190%] w-[150%]"
              onPlaceSelected={(place) => onPlaceSelected(place, "pickup")}
              types={["(regions)"]}
              apiKey={process.env.API_KEY || ""}
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
            <Autocomplete
              placeholder="Dropoff Location"
              className="outline-none bg-gray-200 py-3  pl-2 rounded-md sm:w-[190%] w-[150%]"
              onPlaceSelected={(place) => onPlaceSelected(place, "dropoff")}
              types={["(regions)"]}
              apiKey={process.env.API_KEY || ""}
            />
          </div>
        </div>
        <div>
          <button className="py-2 bg-black text-white pl-4 pr-4 rounded-md">
            Pickup Now
          </button>
        </div>
      </div>
      <SimpleMap />
    </div>
  );
};
export { SimpleMap, Ride };
