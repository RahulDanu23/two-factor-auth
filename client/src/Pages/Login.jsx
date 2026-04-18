// src/pages/Login.jsx
import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    axios.defaults.withCredentials = true

    try {
      const endpoint = state === 'Sign Up' ? '/api/auth/register' : '/api/auth/login'
      const { data } = await axios.post(backendUrl + endpoint, {
        name,
        email,
        password,
      })

      if (data.success) {
        if (state === 'Sign Up') {
          // For registration, show success message and switch to login state
          toast.success('Registration successful! Please login to continue.')
          setState('Login')
          setName('')
          setEmail('')
          setPassword('')
        } else {
          // For login
          if (data.requiresVerification) {
            toast.success(data.message)
            navigate('/email-verify')
          } else {
            setIsLoggedin(true)
            await getUserData()
            toast.success('Login successful')
            navigate('/')
          }
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong')
    }
  }

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
          {state}
        </h2>
        <form onSubmit={onSubmitHandler}>
          {state === 'Sign Up' && (
            <div className='mb-4 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='bg-transparent outline-none text-white w-full'
                type='text'
                placeholder='Enter your name'
                required
              />
            </div>
          )}
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
          <div className='mb-6 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none text-white w-full'
              type='password'
              placeholder='Enter your password'
              required
            />
          </div>
          <button
            type='submit'
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white'
          >
            {state}
          </button>
        </form>
        <p className='text-gray-400 text-center text-xs mt-4'>
          {state === 'Sign Up' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
            className='text-blue-400 cursor-pointer underline'
          >
            {state === 'Sign Up' ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
