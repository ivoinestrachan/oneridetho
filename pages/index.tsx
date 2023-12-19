import Image from "next/image";

import home from "../assets/homepage.svg";
import Link from "next/link";
import { Estimate } from "@/components/Estimate";

export default function Home() {
  return (
    <>
      <div className="sm:flex items-center justify-between sm:w-[95%] h-[650px]">
        <div className="sm:px-10 px-2">
          <Estimate />
        </div>
        <div className="flex justify-center">
          <Image
            src={home}
            alt="home"
            className="sm:rounded-[12px] rounded-[12px] m:ml-0 sm:mr-0 pl-2 pr-2 sm:mt-0 mt-10"
          />
        </div>
      </div>
    </>
  );
}
