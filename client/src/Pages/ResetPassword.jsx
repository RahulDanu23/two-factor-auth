import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const pasteArray = paste.split('');
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
    const lastIndex = Math.min(pasteArray.length, inputRefs.current.length) - 1;
    if (inputRefs.current[lastIndex]) {
      inputRefs.current[lastIndex].focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/send-reset-otp',
        { email },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || 'OTP sent to your email');
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otp = inputRefs.current.map(input => input.value).join('');
    if (otp.length < 6 || !newPassword) {
      toast.error('Please enter 6-digit OTP and new password');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post(
        backendUrl + '/api/auth/reset-password',
        { email, otp, newPassword },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(data.message || 'Password reset successfully');
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 bg-gradient-to-br from-blue-400 to-purple-400'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='Logo'
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm relative'>
        <button 
          onClick={() => isEmailSent ? setIsEmailSent(false) : navigate(-1)} 
          className='absolute top-4 left-4 text-white cursor-pointer hover:text-indigo-400 text-2xl'
        >
          &#8592;
        </button>
        <h2 className='text-3xl font-semibold text-white mb-3 text-center'>
          Reset Password
        </h2>
        
        <p className='text-center text-sm mb-6'>
          {!isEmailSent ? 'Enter your email to receive an OTP' : 'Enter OTP and your new password'}
        </p>

        {!isEmailSent ? (
          <form onSubmit={handleSendOtp}>
            <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className='bg-transparent outline-none text-white w-full'
                type='email'
                placeholder='Enter your email'
                required
              />
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white disabled:opacity-50'
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className='flex justify-between mb-4 gap-2' onPaste={handlePaste}>
              {Array(6).fill(0).map((_, index) => (
                <input
                  key={index}
                  ref={(e) => inputRefs.current[index] = e}
                  type='text'
                  maxLength='1'
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className='w-10 h-10 sm:w-12 sm:h-12 bg-[#333A5C] text-white text-center text-xl rounded-md outline-none focus:ring-2 focus:ring-indigo-500'
                  required
                />
              ))}
            </div>
            <div className='mb-6 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <input
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                className='bg-transparent outline-none text-white w-full'
                type='password'
                placeholder='Enter new password'
                required
              />
            </div>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white disabled:opacity-50'
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
