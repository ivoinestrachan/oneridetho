import React, { useState } from "react";
import { signIn } from 'next-auth/react';
import router, { useRouter } from 'next/router';

type ContactProps = {
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  };
  
  const Contact: React.FC<ContactProps> = ({ setEmail, setPassword, setPhoneNumber }) => {

    const [countryCode, setCountryCode] = useState('1242');
    const [phoneNumber, setPhoneNumberState] = useState('1242');
    const [emailError, setEmailError] = useState('');

    const handleCountryChange = (e: any) => {
      const selectedCountry = e.target.value;
      const prefix = selectedCountry === 'Bahamas' ? '1242' : selectedCountry === 'United States' ? '1' : '';
      setCountryCode(prefix);
      setPhoneNumberState(prefix); 
    };
  
    const handlePhoneNumberChange = (e: any) => {
      let inputNumber = e.target.value.slice(countryCode.length);
      if (inputNumber.length > (10 - countryCode.length)) {
        inputNumber = inputNumber.slice(0, 11 - countryCode.length); 
      }
      const fullPhoneNumber = countryCode + inputNumber;
      setPhoneNumberState(fullPhoneNumber); 
      setPhoneNumber(fullPhoneNumber); 
    };
    const checkEmailExists = async (email: any) => {
      try {
        const response = await fetch(`/api/check-email?email=${email}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.emailExists;
      } catch (error) {
        console.error('Error fetching email:', error);
        return false; 
      }
    };
    
    const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const emailValue = e.target.value;
      setEmail(emailValue);
  
      const isEmailTaken = await checkEmailExists(emailValue);
  
      if (isEmailTaken) {
        setEmailError('Email is already taken');
      } else {
        setEmailError(''); 
      }
    };
    
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
            onChange={handleEmailChange}
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
           {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
        </div>
      
        <div className="mt-2 text-center flex items-center border border-gray-200 rounded-md py-3 pl-3 w-[300px] sm:ml-[50px] ml-[20px]">
        <div className=" text-center">
          <select onChange={handleCountryChange} className="outline-none ml-2">
            <option value="Bahamas">🇧🇸</option>
            <option value="United States">🇺🇸</option>
          </select>
        </div>
          <input
            placeholder="Phone number"
            autoComplete="off"
            value={phoneNumber}
            type="number"
            onChange={handlePhoneNumberChange}
            className="outline-none w-[200px] rounded-md "
            max={7}
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
  const handleNameInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/[^A-Za-z\s]/g, ''); 
    setName(input.value);
  };


  return (
    <div className="flex justify-center space-y-4 mt-10">
      <div className="space-y-5 ">
        <div className="sm:text-[24px] text-[20px] font-semibold text-center">
          Basic Information
        </div>
        <div className="mt-2 text-center">
          <input
            placeholder="Full Name"
            onChange={handleNameInput}
            required
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>
        <div className="mt-2">
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
  
        const dobDate = new Date(dob);
        const currentDate = new Date();
        let age = currentDate.getFullYear() - dobDate.getFullYear();
        const m = currentDate.getMonth() - dobDate.getMonth();
        if (m < 0 || (m === 0 && currentDate.getDate() < dobDate.getDate())) {
          age--;
        }
    
        if (age < 18) {
          setErrorMessage("You must be 18 years or older to sign up.");
          return;
        }

        try {
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
            name,
            dob,
            gender,
            phoneNumber,
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