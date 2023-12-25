import Image from "next/image";

import home from "../assets/homepage.svg";
import Link from "next/link";
import { Estimate } from "@/components/Estimate";

export default function Home() {
  return (
    <>
      <div className="sm:flex items-center sm:justify-between justify-center sm:w-full sm:h-[800px] h-[90vh] hero">
        <div className="sm:block hidden"></div>
        <div className="sm:px-10 px-2 sm:pt-auto pt-5">
          <Estimate />
        </div>
      </div>
     
     
    </>
  );
}
