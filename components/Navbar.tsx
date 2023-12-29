import Image from "next/image";
import logo from "../assets/logo.svg";
import Link from "next/link";
import { useSession, signOut, getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import React from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";

const Navbar = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(session?.user?.image);
  const [isWebcamVisible, setIsWebcamVisible] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [viewProfilePic, setViewProfilePic] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);



  useEffect(() => {
    if (session && !session.user.image) {
      setShowUploadPrompt(true);
    }
  }, [session]);

  const closeUploadPrompt = () => {
    setShowUploadPrompt(false);
  };

  const toggleProfileOptions = () => {
    setShowProfileOptions(!showProfileOptions);
    setViewProfilePic(false); 
  };

  const handleViewProfile = () => {
    setViewProfilePic(true);
    setShowProfileOptions(false);
  };

  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut();
  };


  const toggleWebcam = () => {
    setIsWebcamVisible(!isWebcamVisible);
    closeUploadPrompt();
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
  
            ctx.fillStyle = "rgba(0,0,0,0)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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
    <div className="bg-black" >

{showUploadPrompt && (
        <div className="absolute inset-0 flex justify-center items-center bg-black/50">
          <div className="popup bg-white p-4 rounded">
            <p>Please upload a profile image.</p>
            <button onClick={toggleWebcam} className="py-2 bg-black pl-2 pr-2 text-white rounded-md mt-2">Upload Image</button>
          </div>
        </div>
      )}

{viewProfilePic && (
  <div className="absolute inset-0 flex justify-center items-center"  onClick={() => setViewProfilePic(false)}>
    <Image src={session?.user.image as string} alt="Profile Image"  objectFit="contain"  width={200} height={200}/>
  </div>
)}


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
                <li>Book a ride</li>
              </Link>
              <a href="https://whatsform.com/AnbVNN">
              <li>Apply To Drive</li>
              </a>
            </ul>
          </div>
        </div>

        <div className="sm:flex items-center gap-4  hidden ">
          <a href="https://www.facebook.com/profile.php?id=100075942281898">
    <FaFacebook  size={30} className="text-white hover:text-blue-600" />
    </a>
    <a href="https://www.tiktok.com/@oneridetho?is_from_webapp=1&sender_device=pc">
    <FaTiktok  size={30} className="text-white hover:text-blue-600"/>
    </a>

    <a href="https://www.instagram.com/oneridetho242/">
    <FaInstagram size={30} className="text-white hover:text-blue-600" />
    </a>
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
              <div  onClick={toggleProfileOptions} className="cursor-pointer">
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


              <div onClick={handleDropdown} className="cursor-pointer bg-white py-2 pr-4 pl-4 text-black rounded-full">
                {session.user?.name}
              </div>

              {showProfileOptions && (
          <div className="absolute bg-white text-black p-2 rounded shadow sm:mt-[120px] mt-[160px] sm:ml-[10px] ml-[80px] z-10">
          <div>
            <button onClick={handleViewProfile}>View Profile</button>
            </div>

            <div>
            <button onClick={toggleWebcam}>Upload Profile</button>
            </div>
          </div>
        )}
              {dropdownOpen && (
                <div className="absolute bg-white p-2 rounded shadow sm:mt-[120px] mt-[160px]  sm:w-[10%] w-[30%] sm:ml-[50px] ml-[80px] z-10">
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