import Image from "next/image";
import logo from "../assets/logo.svg";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    signOut();
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
                <button className="font-sans font-bold">
                  Login
                </button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <Image
                  src={session.user?.image || "https://res.cloudinary.com/dxmrcocqb/image/upload/v1700749220/Social_Media_Chatting_Online_Blank_Profile_Picture_Head_And_Body_Icon_People_Standing_Icon_Grey_Background_generated_qnojdz.jpg"}
                  alt="pfp"
                  height={40}
                  width={40}
                  className="rounded-full"
                />
              </div>
              <div onClick={handleDropdown} className="cursor-pointer">{session.user?.name}</div>
              {dropdownOpen && (
                <div className="absolute bg-white p-2 rounded shadow mt-[110px] ml-10 sm:w-[10%] w-[30%]">
                  <ul>
                  <Link href="/rides">
                      <li className="text-black hover:bg-gray-200 w-full">Rides</li>
                    </Link>
                    <button onClick={handleLogout} className="text-black hover:bg-gray-200 w-full text-left">Logout</button> 
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
