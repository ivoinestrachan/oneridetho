import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import logo from "../../assets/logo.svg"

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); 
  const [loginError, setLoginError] = useState('');



  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(''); 
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    });
  
    if (result && !result.error) {
      console.log('Signed in successfully!');
      router.push('/');
    } else if (result) {
      setLoginError('Email or password is incorrect');
    }
  };

  return (
    <div className='flex justify-center mt-[150px]'>
      <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='text-center flex justify-center'>
        <Image src={logo} alt='logo' />
      </div>
        <div>
          <input
            placeholder="email"
            type="email"
            value={email}
            autoComplete='off'
            onChange={(e) => setEmail(e.target.value)}
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>

        <div>
          <input
            placeholder="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border outline-none py-3 pl-3 w-[300px] border-gray-200 rounded-md "
          />
        </div>

        <div>
          <button type="submit"
          className="bg-black py-3 pl-[130px] pr-[130px] text-white rounded-md"
          >Login</button>
        </div>
  {/* 
        <div className="mt-5">
            <button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
            className="bg-blue-400 py-3 pl-[100px] pr-[70px] text-white rounded-md  ">
              Login with Google
            </button>
          </div>
  */}
        {loginError && <div className="text-red-500">{loginError}</div>}
      </form>
    </div>
  );
}