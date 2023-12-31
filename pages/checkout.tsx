import { useRouter } from "next/router";
import { IoMdPerson } from "react-icons/io";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/Spinner";


interface Stop {
  lat: number;
  lng: number;
  address?: string; 
}

declare global {
  interface Window {
    paypal?: any; 
  }
}

const Checkout = () => {
  const router = useRouter();
  const { pickup, dropoff, fare, passengers, stops: stopsQuery, isScheduled } = router.query;
  const [isPayPalReady, setPayPalReady] = useState(false);
  const [paypalSdkReady, setPaypalSdkReady] = useState(false);
 
  const { data: session, status } = useSession();
  const [showProfilePhotoMessage, setShowProfilePhotoMessage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const [stopsWithAddress, setStopsWithAddress] = useState<Stop[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('');


  useEffect(() => {
    let stops: Stop[] = [];
    try {
      stops = stopsQuery ? JSON.parse(decodeURIComponent(stopsQuery as string)) : [];
    } catch (error) {
      console.error("Error parsing stops:", error);
    }

    const fetchAddresses = async () => {
      const updatedStops = await Promise.all(stops.map(async (stop) => {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${stop.lat},${stop.lng}&key=${process.env.API_KEY}`);
        const data = await response.json();
        return { ...stop, address: data.results[0]?.formatted_address };
      }));
      setStopsWithAddress(updatedStops);
    };

    fetchAddresses();
  }, [stopsQuery]);


  const handleEdit = () => {
    router.push("/book?editing=true");
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    if (!paymentMethod) {
      console.error('No payment method selected.');
      return;
    }
    try {
      const bookingData = {
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        fare: fare,
        passengerCount: passengers,
        stops: stopsWithAddress,
        paymentMethod: paymentMethod, 
      };

      console.log("Booking data being sent:", bookingData);

      if (isScheduled) {
        alert('Ride scheduled successfully!');
        router.push('/'); 
        return;
    }
  
      const response = await axios.post('/api/bookings', bookingData);
      const { rideId } = response.data;
  
      router.push(`rides/[rideId]?rideId=${rideId}`);
    } catch (error) {
      console.error('Error during booking:', error);
    }
    setIsLoading(false);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/photo", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
      } else {
        console.error("Failed to upload photo");
      }
    }
  };
  
  useEffect(() => {
    if (typeof window !== "undefined" && !window.paypal) {
      loadPayPalSdk();
    }
  }, []);

  const handlePaymentMethodChange = (method: any) => {
    setPaymentMethod(method);
    console.log("Selected payment method:", method);
  };

  const loadPayPalSdk = () => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLI}`;
    script.onload = () => {
      setPaypalSdkReady(true);
      renderPayPalButton();
    };
    document.body.appendChild(script);
  };
  const renderPayPalButton = () => {
    console.log("Rendering PayPal button with fare:", fare); 
  
    if (!window.paypal || !document.getElementById("paypal-button-container")) {
      console.error("PayPal button cannot be rendered yet.");
      return;
    }
  

    const paypalButtonContainer = document.getElementById("paypal-button-container");
    if (!paypalButtonContainer) {
      console.error("PayPal button container not found.");
      return;
    }

    if (paypalButtonContainer.childElementCount > 0) {
 
      return;
    }

    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: fare,
            },
          }],
        });
      },
      onApprove: (data: any, actions: any) => {
        return actions.order.capture().then((details: any) => {
          console.log('Payment Successful:', details);
          setPaymentMethod('Card'); 
        });
      },
      onError: (err:any) => {
        console.error('Payment Error:', err);
      }
    }).render('#paypal-button-container');
  };
  useEffect(() => {
    if (paypalSdkReady) {
      renderPayPalButton();
    }
  }, [paypalSdkReady]);
  

  useEffect(() => {
    if (status === 'loading') return; 
    if (!session) {
      router.push('/auth/signup');
    } else if (!session.user.image) {
      setShowProfilePhotoMessage(true); 
    }
  }, [session, status, router]);
  
  if (status === 'loading') {
      return <div>Loading...</div>;
  }

  const cashPaymentMessages = (
    <div className="mt-5 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 sm:w-[500px]">
      <div className="font-bold">Note:</div>
      <p>Payment is required upon entry of vehicle.</p>
      <p>Drivers do not carry change.</p>
    </div>
  );
  

  return (
    <div className="px-2 mt-5">
      <h1 className="font-bold text-[32px]">Checkout</h1>
     
      <div >
         {/*
   <div id="paypal-button-container">
   </div>
  */}
    {/*
        <div>
          <button className="py-3 bg-black text-white pl-4 pr-4 rounded-md mt-5">
            Pay with Cash
          </button>
        </div>
      */}
        <div>
          <button className="py-3 bg-black text-white pl-4 pr-4 rounded-md mt-5 sm:w-auto w-full text-center"
           onClick={() => handlePaymentMethodChange('Cash')}
          >
            Pay with Cash
          </button>
        </div>

      </div>
      <div className="border rounded-md sm:w-[450px] w-[370px] sm:h-[28vh] h-[30vh] px-2 mt-5 pt-5 space-y-2">
      <p className="font-bold">Pickup Location: <span className="font-normal">{pickup}</span></p>
      <p className="font-bold">Dropoff Location: <span className="font-normal">{dropoff}</span></p>
      {stopsWithAddress.map((stop, index) => (
          <p key={index} className="font-bold">Stop {index + 1}: 
            <span className="font-normal">{stop.address || 'Loading address...'}</span>
          </p>
        ))}
      <p className="font-bold">Fare: $<span className="font-normal">{fare}</span></p>
      <p className="flex items-center gap-4"> <IoMdPerson size={24} /> {passengers}</p>
      </div>
      <div className="flex items-center gap-3">
        <div>
          <button
            onClick={handleEdit}
            className="py-3 bg-black text-white pl-12 pr-12 rounded-md mt-5"
          >
            Edit Ride
          </button>
        </div>
        {paymentMethod && (
        <div>
          <button className="py-3 bg-black text-white pl-12 pr-12 rounded-md mt-5"
          onClick={handleCheckout}
          >
 {isLoading ? <Spinner /> : 'Confirm Ride'}
          </button>
        </div>
        )}
      </div>
      {paymentMethod === 'Cash' && cashPaymentMessages}
      {showProfilePhotoMessage && (
        <div className="mt-5 p-4 bg-red-100 border border-red-400 text-red-700 sm:w-[50%]">
          <p>Please upload a valid  photo to proceed.</p>
          <input type="file" 
           className="mt-2"
           onChange={handleFileChange}
           ref={fileInputRef}
           />
        </div>
      )}

    </div>
  );
};



export default Checkout;
