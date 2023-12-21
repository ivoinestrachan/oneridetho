import Image from "next/image";

import home from "../assets/homepage.svg";
import Link from "next/link";
import { Estimate } from "@/components/Estimate";

export default function Home() {
  return (
    <>
      <div className="sm:flex items-center sm:justify-between justify-center sm:w-full sm:h-[650px] h-[90vh] hero">
        <div className="sm:block hidden"></div>
        <div className="sm:px-10 px-2 sm:pt-auto pt-5">
          <Estimate />
        </div>
      </div>
      <div className="section w-full sm:block hidden">
      <div className="flex justify-between text-white w-[95%] absolute z-10">
      <div></div>
      <div className="mt-5">
        <div className="font-bold text-[25px]">Booking rides all around the bahamas</div>
        <div className="text-[18px]">Affordable, Reliable and Safe Rides in The Bahamas</div>
        <Link href="/book">
        <div className="mt-5">
          <button
           className="py-2 bg-black text-white pl-4 pr-4 rounded-md"
          >Book Now</button>
        </div>
        </Link>
      </div>
      </div>
      </div>
    </>
  );
}
