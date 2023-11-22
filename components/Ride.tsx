import GoogleMapReact from "google-map-react";

interface MapProps {
  text: string;
  lat: number;
  lng: number;
}

const Map: React.FC<MapProps> = ({ text }) => (
  <div>{text}</div>
);

function SimpleMap() {
  const defaultProps = {
    center: {
      lat: 10.99835602,
      lng: 77.01502627,
    },
    zoom: 11,
  };

  return (
    <div style={{ height: "50vh", width: "50%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.API_Key || ''}}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
      >
        <Map lat={59.955413} lng={30.337844} text="My Marker" />
      </GoogleMapReact>
    </div>
  );
}

const Ride = () => {
  return (
    <div className="space-y-4 mt-5 ">
      <div className="flex items-center sm:w-[30%] w-[95%] justify-between">
        <div>
          <input
            placeholder="Pickup Location"
            className="outline-none bg-gray-200 sm:py-3 py-2 pl-2 rounded-md sm:w-[200%] w-[150%]"
          />
        </div>
        <div>
          <button className="bg-black text-white rounded-md py-2 pr-4 pl-4 text-[20px]">
            +
          </button>
        </div>
      </div>
      <div className="flex items-center">
        <div>
          <input
            placeholder="Dropoff Location"
            className="outline-none bg-gray-200 sm:py-3 py-2 pl-2 rounded-md sm:w-[200%] w-[150%]"
          />
        </div>
        <div></div>
      </div>
      <div>
        <button>Pickup Now</button>
      </div>
      
      <SimpleMap />
    </div>
  );
};
export { SimpleMap, Ride };
