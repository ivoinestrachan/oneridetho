import Image from "next/image";
import logo from "../assets/logo.svg";
import Link from "next/link";
import { useSession, signOut, getSession } from "next-auth/react";
import { useRef, useState } from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(session?.user?.image);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
    }
  };


  return (
    <div className="bg-black">
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
              <div onClick={triggerFileInput} className="cursor-pointer">
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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
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
