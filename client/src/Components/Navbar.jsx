import React, { useContext, useState, useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setShowDropdown(!showDropdown);
  };

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/logout', {}, { withCredentials: true });
      if (data.success) {
        setUserData(null);
        setIsLoggedin(false);
        setShowDropdown(false); // Close dropdown after logout
        toast.success('Logged out successfully');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-verify-otp', {}, { withCredentials: true });
      if (data.success) {
        setShowDropdown(false); // Close dropdown after action
        toast.success('Verification OTP sent to your email');
        navigate('/email-verify');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className='w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0'>
      <img src={assets.logo} alt="Logo" className='w-28 sm:w-32' />

      {userData ? (
        <div className='relative' ref={dropdownRef}>
          {/* User Avatar with Dropdown */}
          <div className='relative'>
            {/* Avatar Circle - Clickable */}
            <div 
              onClick={toggleDropdown}
              className='w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-lg hover:bg-indigo-700 transition-colors cursor-pointer active:scale-95'
            >
              {userData.name[0].toUpperCase()}
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 animate-fadeIn'>
                {/* User Info */}
                <div className='px-4 py-2 border-b border-gray-100'>
                  <p className='text-sm font-medium text-gray-800'>{userData.name}</p>
                  <p className='text-xs text-gray-500'>{userData.email}</p>
                </div>

                {/* Menu Items */}
                {!userData.isAccountVerified && (
                  <div 
                    onClick={handleVerifyEmail}
                    className='px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 cursor-pointer active:bg-gray-100'
                  >
                    Verify Email
                  </div>
                )}
                <div 
                  onClick={handleLogout}
                  className='px-4 py-2 text-sm text-red-600 hover:bg-gray-50 cursor-pointer active:bg-gray-100'
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => navigate('/login')}
          className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all'
        >
          Login <img src={assets.arrow_icon} alt="arrow" className='w-4 h-4' />
        </button>
      )}
    </div>
  );
};

export default Navbar;
