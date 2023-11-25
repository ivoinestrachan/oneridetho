import Image from "next/image";

import home from "../assets/homepage.svg";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="sm:flex items-center justify-between sm:w-[95%] h-[650px]">
        <div className="sm:px-10 px-2">
          <div className="font-bold text-[46px]">
            Buii I need a <br></br>ride
          </div>
          <div className="sm:hidden block ">
            Safest Transportation company in The Bahamas Our transportation
            company is committed to providing safe, reliable, and affordable
            services to our customers.
          </div>
          <div className="text-[18px] sm:block hidden">
            Safest Transportation company in The Bahamas<br></br>
            Our transportation company is committed to providing safe, reliable,
            and
            <br></br> affordable services to our customers. Safety is our top
            priority, and we ensure<br></br> that our vehicles are regularly
            inspected and maintained to the highest<br></br> standards. In
            addition to safety, we strive to offer reliable services, ensuring
            that<br></br> our vehicles arrive promptly and are available for our
            customers' convenience.<br></br> Furthermore, we understand the
            importance of affordability, and we have<br></br> designed our
            pricing structure to be competitive and accessible to a wide range
            <br></br> of customers. With our transportation company, you can
            trust that your journey<br></br> will be safe, reliable, and
            affordable.
          </div>
          <Link href="/book">
          <div>
            <button className="py-3 bg-black text-white pl-12 pr-12 rounded-md mt-5">Book a Ride</button>
          </div>
          </Link>
        </div>
        <div className="flex justify-center">
          <Image
            src={home}
            alt="home"
            className="sm:rounded-[12px] rounded-[12px] m:ml-0 sm:mr-0 pl-2 pr-2 sm:mt-0 mt-5"
          />
        </div>
      </div>

    </>
  );
}
