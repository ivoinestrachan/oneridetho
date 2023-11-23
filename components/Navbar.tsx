import Image from "next/image";
import logo from "../assets/logo.svg";
import Link from "next/link";

const Navbar = () => {
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
              <li>About Us</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-5 text-white font-sans font-bold">
          <div>
            <Link href="/auth/signup">
            <button className="bg-white text-black py-2 pr-4 pl-4 rounded-[4px]">
              Sign Up
            </button>
            </Link>
          </div>
          <div>
          <Link href="/auth/login">
            <button>Login</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
