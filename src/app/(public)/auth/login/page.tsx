'use client';

import toastService from '@/lib/services/toastService';
import { LoginUserInput } from '@/types/userType';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import React, { useState } from 'react';
import { Eye, EyeClosed } from 'lucide-react';

export default function Register() {
  const [show, setShow] = useState<boolean>(true);
  const router = useRouter();
  const [formData, setFormData] = useState<LoginUserInput>({
    username: '',
    email: '',
    phone: '',
    password: '',
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Basic client-side validation
    if (!formData.email || !formData.password || !formData.phone) {
      toastService.error('Please enter username, email, or phone.');
      return;
    }
    try {
      console.log('Submitting formData:', formData); // Debug form data
      const response = await fetch('/api/login', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(formData), // Send only formData, excluding confirmPassword
      });

      if (!response.ok) {
        const data = await response.json();
        toastService.error('Login Failed');
        throw new Error(data.error?.message || response.statusText);
      }

      router.push('/profile'); // Navigate to profile on success
    } catch (err: any) {
      console.error('Login error:', err);
      toastService.error(err.message || 'Login Failed');
    }
  };

  return (
    <section className='p-6 mx-auto'>
      <form className='max-w-3xl flex flex-col gap-2' onSubmit={handleSubmit}>
        <label htmlFor='username-email-phone'>Enter your username, email, or phone: </label>
        <input
          className='outline'
          id='username-email-phone'
          type='text'
          name='username-email-phone'
          placeholder='Enter your username, email, or phone'
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <div>
          <label htmlFor='password'>Password: </label>
          <input
            className='outline'
            id='password'
            type={show ? 'text' : 'password'} // Use password type for security
            name='password'
            placeholder='Enter your password'
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button onClick={() => setShow(!show)} type='button'>
            {show ? <Eye /> : <EyeClosed />}
          </button>
        </div>
        <button className='outline' type='submit'>
          Submit
        </button>
      </form>
    </section>
  );
}
