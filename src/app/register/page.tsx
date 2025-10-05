'use client';

import { CreateUserInput } from '@/types/userType';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import React, { useState } from 'react';

export default function Register() {
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState<CreateUserInput>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    provider: {
      facebook: null,
      instagram: null,
      google: null,
    },
    uploads: null,
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null); // Clear error on input change
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Basic client-side validation
    if (
      !formData.firstName ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setError('All required fields must be filled.');
      return;
    }

    // Validate password match
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // if (!/^\+?[0-9]{10,15}$/.test(formData.phone)) {
    //   setError('Invalid phone number format.');
    //   return;
    // }

    try {
      console.log('Submitting formData:', formData); // Debug form data
      const response = await fetch('/api/register', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(formData), // Send only formData, excluding confirmPassword
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || response.statusText);
      }

      router.push('/profile'); // Navigate to profile on success
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <section className='p-6 mx-auto'>
      <form className='max-w-3xl flex flex-col gap-2' onSubmit={handleSubmit}>
        {error && <p className='text-red-500'>{error}</p>}
        <label htmlFor='firstName'>First Name: </label>
        <input
          className='outline'
          type='text'
          id='firstName'
          name='firstName'
          placeholder='Enter your First Name'
          value={formData.firstName}
          onChange={handleInputChange}
          required
        />
        <label htmlFor='lastName'>Last Name: </label>
        <input
          className='outline'
          id='lastName'
          type='text'
          name='lastName'
          placeholder='Enter your Last Name'
          value={formData?.lastName!}
          onChange={handleInputChange}
        />
        <label htmlFor='username'>Username: </label>
        <input
          className='outline'
          id='username'
          type='text'
          name='username'
          placeholder='Enter your Username'
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <label htmlFor='password'>Password: </label>
        <input
          className='outline'
          id='password'
          type='password' // Use password type for security
          name='password'
          placeholder='Enter your password'
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <label htmlFor='confirm-password'>Confirm Password: </label>
        <input
          id='confirm-password'
          className='outline'
          type='password' // Use password type for security
          name='confirmPassword'
          placeholder='Enter your confirm password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <label htmlFor='email'>Email: </label>
        <input
          id='email'
          className='outline'
          type='email'
          name='email'
          placeholder='Enter your Email'
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <label htmlFor='phone'>Phone: </label>
        <input
          id='phone'
          className='outline'
          type='text'
          name='phone'
          placeholder='Enter your Phone'
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        <button className='outline' type='submit'>
          Submit
        </button>
      </form>
    </section>
  );
}
