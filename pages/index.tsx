import { Estimate } from "@/components/Estimate";
import Mobilesoc from "@/components/Mobilesoc";
import Image from "next/image";
import { useEffect, useRef } from "react";
import bahamar from "../assets/bahamar.jpeg";
import atlantis from "../assets/atlantis.jpg";
import junk from "../assets/junkanoo.jpg";
import driver from "../assets/driver.jpeg";
export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTime = 45;
  const endTime = 58;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const setStartTime = () => {
      if (video.readyState >= 3) {
        video.currentTime = startTime;
        video.play();
      }
    };

    const checkTimeAndLoop = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        video.play();
      }
    };

    video.addEventListener("loadeddata", setStartTime);
    video.addEventListener("timeupdate", checkTimeAndLoop);

    if (video.readyState >= 3) {
      setStartTime();
    }

    return () => {
      if (video) {
        video.removeEventListener("loadeddata", setStartTime);
        video.removeEventListener("timeupdate", checkTimeAndLoop);
      }
    };
  }, [startTime, endTime]);

  return (
    <>
      <div className="sm:flex items-center sm:justify-between justify-center sm:w-full sm:h-[650px] h-[90vh] hero">
        <video autoPlay muted loop ref={videoRef} className="videoBackground">
          <source src="/videos/testvid.mp4" type="video/mp4" />
        </video>

        <div className="sm:block hidden"></div>
        <div className="sm:px-10 px-2 sm:pt-auto pt-5 sm:mt-[150px] mt-10">
          <Estimate />
        </div>
      </div>

      <div className="sm:block hidden">
        <div className="text-center font-bold text-[24px]">Open 24/7</div>
        <div className="text-center text-[18px]">
          Safe, Affordable, and Reliable Rides
        </div>

        <div className="flex justify-center mt-2 gap-5 pb-2">
          <Image src={bahamar} alt="places" width={350} height={350} />
          <Image src={atlantis} alt="places" width={350} height={350} />
          <Image src={junk} alt="places" width={350} height={350} />
        </div>
      </div>

<div className="text-center mt-5 sm:block hidden font-bold text-[24px]">Our Drivers</div>
      <div className="sm:flex hidden mt-10 justify-between items-center w-[90%]">
        <div className="px-20">
          <Image src={driver} width={300} height={300} alt="driver" />
        </div>

        <div className="w-[50%]">
          <span className="font-bold text-[24px]">Safest Transportation company in The Bahamas</span><br>
          </br> Our transportation
          company is committed to providing safe, reliable, and affordable
          services to our customers. Safety is our top priority, and we ensure
          that our vehicles are regularly inspected and maintained to the
          highest standards. In addition to safety, we strive to offer reliable
          services, ensuring that our vehicles arrive promptly and are available
          for our customers' convenience. Furthermore, we understand the
          importance of affordability, and we have designed our pricing
          structure to be competitive and accessible to a wide range of
          customers. With our transportation company, you can trust that your
          journey will be safe, reliable, and affordable.
        </div>
      </div>
      <Mobilesoc />
    </>
  );
}
