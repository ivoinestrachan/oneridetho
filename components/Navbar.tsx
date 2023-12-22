import Image from "next/image";
import logo from "../assets/logo.svg";
import Link from "next/link";
import { useSession, signOut, getSession } from "next-auth/react";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import React from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(session?.user?.image);
  const [isWebcamVisible, setIsWebcamVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);


  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut();
  };


  const toggleWebcam = () => {
    setIsWebcamVisible(!isWebcamVisible);
  };


  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
  
       
      if (imageSrc) {
        const img = document.createElement('img');
        img.src = imageSrc;
  
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          if (ctx) {
            const size = Math.min(img.width, img.height);
            canvas.width = size;
            canvas.height = size;
  
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
            ctx.clip();
            ctx.drawImage(img, 5, 5, size, size);
  
            canvas.toBlob(blob => {
              if (blob) {
                const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
                handleFileUpload(file);
                setIsWebcamVisible(false); 
              }
            }, 'image/jpeg');
          }
        };
      }
    }
  }, [webcamRef]);
  
  

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/photo", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      setProfileImage(data.imageUrl);

      const updatedSession = await getSession();
      if (updatedSession) {
        updatedSession.user.image = data.imageUrl;
      }
    } else {
      console.error("Failed to upload photo");
    }
  };

 

  return (
    <div className="bg-black">
  {isWebcamVisible && (
        <div className="absolute h-[100vh]">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="z-10 h-[100vh] object-cover w-full"
          />
           <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
            <div className="border-2 border-white rounded-full w-[300px] h-[300px] opacity-50" />
          <button onClick={capture} className="bg-white h-[70px] w-[70px] rounded-full z-10 sm:bottom-[150px] bottom-5 text-center absolute  left-1/2 transform -translate-x-1/2 -translate-y-1/2"></button>
        </div>
        </div>
     
      )}

      <div className="flex items-center justify-between w-[95%] h-[10vh]">
        <div className="flex items-center">
          <Link href="/">
            <div>
              <Image
                src={logo}
                alt="one ride tho"
                draggable="false"
                height={50}
              />
            </div>
          </Link>
          <div>
            <ul className="sm:flex items-center gap-5 text-white font-sans font-bold hidden">
              <Link href="/book">
                <li>Book Now</li>
              </Link>
              <li>Drive</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-5 text-white ">
          {!session ? (
            <>
              <Link href="/auth/signup">
                <button className="bg-white text-black py-2 pr-4 pl-4 rounded-[4px] font-sans font-bold">
                  Sign Up
                </button>
              </Link>

              <Link href="/auth/login">
                <button className="font-sans font-bold">Login</button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div  onClick={toggleWebcam}className="cursor-pointer">
                <Image
                  src={
                    session.user?.image ||
                    "https://res.cloudinary.com/dxmrcocqb/image/upload/v1700749220/Social_Media_Chatting_Online_Blank_Profile_Picture_Head_And_Body_Icon_People_Standing_Icon_Grey_Background_generated_qnojdz.jpg"
                  }
                  alt="pfp"
                  height={50}
                  width={50}
                  className="rounded-full object-cover"
                />
              </div>

              <div onClick={handleDropdown} className="cursor-pointer">
                {session.user?.name}
              </div>
              {dropdownOpen && (
                <div className="absolute bg-white p-2 rounded shadow mt-[145px]  sm:w-[10%] w-[25%]">
                  <ul>
                    <Link href="/book">
                      <li className="text-black hover:bg-gray-200 w-full sm:hidden">
                        Book a Ride
                      </li>
                    </Link>
                    <Link href="/apply">
                      <li className="text-black hover:bg-gray-200 w-full sm:hidden">
                        Drive
                      </li>
                    </Link>
                    <Link href="/rides">
                      <li className="text-black hover:bg-gray-200 w-full">
                        Rides
                      </li>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-black hover:bg-gray-200 w-full text-left"
                    >
                      Logout
                    </button>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;