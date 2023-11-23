import React, { useState } from "react";
import { signIn } from 'next-auth/react';
import router, { useRouter } from 'next/router';

type ContactProps = {
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  };
  
  const Contact: React.FC<ContactProps> = ({ setEmail, setPassword, setPhoneNumber }) => {
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
            type="tel"
            onChange={(e) => setPhoneNumber(e.target.value)}
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

type BasicInfoProps = {
  setName: React.Dispatch<React.SetStateAction<string>>;
  setDob: React.Dispatch<React.SetStateAction<string>>;
  setGender: React.Dispatch<React.SetStateAction<string>>;
};

const BasicInfo: React.FC<BasicInfoProps> = ({ setName, setDob, setGender }) => {

  return (
    <div className="flex justify-center space-y-4 mt-10">
      <div className="space-y-5 ">
        <div className="sm:text-[24px] text-[20px] font-semibold text-center">
          Basic Information
        </div>
        <div className="mt-2 text-center">
          <input
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>
        <div className="mt-2 ">
          <div>
            <label className="font-semibold">Birthday</label>
          </div>
          <input
            type="date"
            onChange={(e) => setDob(e.target.value)}
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
              onChange={(e) => setGender(e.target.value)}
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
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
  
  
    const nextStep = async () => {
        if (step === 2) {
            try {
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                    name,
                    dob,  
                    gender ,
                    phoneNumber
                });

                if (result && result.error) {
                    setErrorMessage(result.error);
                } else {
                    router.push('/');
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
          {step === 1 && <Contact setEmail={setEmail} setPassword={setPassword}  setPhoneNumber={setPhoneNumber}/>}
          {step === 2 && <BasicInfo setName={setName} setDob={setDob} setGender={setGender} />}
  
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