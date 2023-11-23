import React, { useState } from "react";
import { signIn } from 'next-auth/react';

type ContactProps = {
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
  };
  
  const Contact: React.FC<ContactProps> = ({ setEmail, setPassword }) => {
  return (
    <div className="flex justify-center space-y-4 mt-10">
      <div className="space-y-5 ">
        <div className="sm:text-[24px] text-[20px] font-semibold">
          Phone number and email to create an <br></br>account
        </div>
        <div className="mt-2 text-center">
          <input
            placeholder="Email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>

        <div className="mt-2 text-center">
          <input
            placeholder="Phone number"
            type="number"
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>

        <div className="mt-2 text-center">
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>
      </div>
    </div>
  );
};

const BasicInfo = () => {
  return (
    <div className="flex justify-center space-y-4 mt-10">
      <div className="space-y-5 ">
        <div className="sm:text-[24px] text-[20px] font-semibold text-center">
          Basic Information
        </div>
        <div className="mt-2 text-center">
          <input
            placeholder="Full Name"
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>
        <div className="mt-2 ">
          <div>
            <label className="font-semibold">Birthday</label>
          </div>
          <input
            type="date"
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md mt-2"
          />
        </div>
        <div>
          <div className="font-semibold">Gender</div>
          <div className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md mt-2">
            <select
              name="Gender"
              id="Gender"
              className="w-[280px] outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

const Signup = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  
    const nextStep = async () => {
        if (step === 2) {
          try {
            const result = await signIn('credentials', {
              redirect: false,
              email,
              password,
            });
      
            if (result && result.error) {
              setErrorMessage(result.error);
            } else {
              // redirect after signup
            }
          } catch (error) {
            if (error instanceof Error) {
              setErrorMessage(error.message);
            } else {
              setErrorMessage('An unexpected error occurred.');
            }
          }
        } else {
          setStep(step + 1);
        }
      };
      
  
    return (
      <div className="flex justify-center space-y-4 mt-10">
        <div className="space-y-5">
          {step === 1 && <Contact setEmail={setEmail} setPassword={setPassword} />}
          {step === 2 && <BasicInfo />}
  
          <div className="text-center mt-5">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button
              onClick={nextStep}
              className="bg-black py-3 pl-[130px] pr-[130px] text-white rounded-md"
            >
              {step === 2 ? "Sign Up" : "Next"}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default Signup;