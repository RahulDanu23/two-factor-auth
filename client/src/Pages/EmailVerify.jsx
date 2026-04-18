import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/verify-account',
        { otp },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Email verified successfully');
        await getUserData(); // Refresh user data
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/send-verify-otp',
        {},
        { withCredentials: true }
      );
      if (data.success) {
        toast.success('OTP sent to your email');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue to-purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='Logo'
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white mb-3 text-center'>
          Verify Your Email
        </h2>
        <p className='text-center text-sm mb-6'>
          Please enter the OTP sent to your email address
        </p>

        <form onSubmit={handleVerify}>
          <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
              className='bg-transparent outline-none text-white w-full'
              type='text'
              placeholder='Enter OTP'
              required
            />
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white disabled:opacity-50'
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className='text-gray-400 text-center text-xs mt-4'>
          Didn't receive OTP?{' '}
          <button
            onClick={handleResendOtp}
            className='text-blue-400 cursor-pointer underline'
          >
            Resend OTP
          </button>
        </p>
      </div>
    </div>
  );
};

export default EmailVerify;
