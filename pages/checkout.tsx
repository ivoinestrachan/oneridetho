import { useRouter } from "next/router";
import { IoMdPerson } from "react-icons/io";

const Checkout = () => {
  const router = useRouter();
  const { pickup, dropoff, fare, passengers } = router.query;
  

  const handleEdit = () => {
    router.push("/book?editing=true");
  };

  return (
    <div className="px-2 mt-5">
      <h1 className="font-bold text-[32px]">Checkout</h1>
      <div className="flex items-center gap-3">
        <div>
          <button className="py-3 bg-black text-white pl-4 pr-4 rounded-md mt-5">
            Pay with Cash
          </button>
        </div>

        <div>
          <button className="py-3 bg-black text-white pl-4 pr-4 rounded-md mt-5">
            Pay with Card
          </button>
        </div>
      </div>
      <div className="border rounded-md sm:w-[450px] w-[370px] sm:h-[23vh] h-[28vh] px-2 mt-5 pt-5 space-y-2">
      <p className="font-bold">Pickup Location: <span className="font-normal">{pickup}</span></p>
      <p className="font-bold">Dropoff Location: <span className="font-normal">{dropoff}</span></p>
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
        <div>
          <button className="py-3 bg-black text-white pl-12 pr-12 rounded-md mt-5">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
