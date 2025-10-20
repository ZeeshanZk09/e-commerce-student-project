'use client';

import toastService from '@/lib/services/toastService';
import { CreateUserInput } from '@/types/userType';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CreateUserInput>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    provider: { facebook: null, instagram: null, google: null },
    uploads: null,
  } as CreateUserInput);

  // simple field updater
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Enter a valid email.';

    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters.';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (formData.password !== confirmPassword)
      newErrors.confirmPassword = "Passwords don't match.";

    if (!formData.phone.trim()) newErrors.phone = 'Phone is required.';
    else if (!/^\+?[0-9]{7,15}$/.test(formData.phone))
      newErrors.phone = 'Enter a valid phone number (7-15 digits).';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      toastService.error('Please fix the errors in the form.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error?.message || response.statusText || 'Registration failed');
      }

      toastService.success('Registration successful! Redirecting...');
      router.push('/profile');
    } catch (err: any) {
      console.error('Registration error:', err);
      toastService.error(err.message || 'Registration Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='max-w-3xl mx-auto p-6'>
      <div className='bg-black/80 backdrop-blur-sm rounded-2xl shadow-md p-6'>
        <h2 className='text-2xl font-semibold mb-4'>Create an account</h2>
        <p className='text-sm text-gray-600 mb-6'>Quickly create an account to get started.</p>

        <form className='grid grid-cols-1 sm:grid-cols-2 gap-4' onSubmit={handleSubmit} noValidate>
          {/* First Name */}
          <label className='flex flex-col'>
            <span className='text-sm font-medium'>First name</span>
            <input
              name='firstName'
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder='John'
              className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.firstName ? 'border-red-400' : 'border-gray-200'
              }`}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && <small className='text-red-600 mt-1'>{errors.firstName}</small>}
          </label>

          {/* Last Name */}
          <label className='flex flex-col'>
            <span className='text-sm font-medium'>Last name</span>
            <input
              name='lastName'
              value={formData?.lastName!}
              onChange={handleInputChange}
              placeholder='Doe'
              className='mt-1 p-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1'
            />
          </label>

          {/* Username */}
          <label className='flex flex-col sm:col-span-2'>
            <span className='text-sm font-medium'>Username</span>
            <input
              name='username'
              value={formData.username}
              onChange={handleInputChange}
              placeholder='@username'
              className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.username ? 'border-red-400' : 'border-gray-200'
              }`}
              aria-invalid={!!errors.username}
            />
            {errors.username && <small className='text-red-600 mt-1'>{errors.username}</small>}
          </label>

          {/* Email */}
          <label className='flex flex-col sm:col-span-2'>
            <span className='text-sm font-medium'>Email</span>
            <input
              name='email'
              type='email'
              value={formData.email}
              onChange={handleInputChange}
              placeholder='you@example.com'
              className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.email ? 'border-red-400' : 'border-gray-200'
              }`}
              aria-invalid={!!errors.email}
            />
            {errors.email && <small className='text-red-600 mt-1'>{errors.email}</small>}
          </label>

          {/* Phone */}
          <label className='flex flex-col'>
            <span className='text-sm font-medium'>Phone</span>
            <input
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              placeholder='+923XXXXXXXXX'
              className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.phone ? 'border-red-400' : 'border-gray-200'
              }`}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <small className='text-red-600 mt-1'>{errors.phone}</small>}
          </label>

          {/* Password */}
          <label className='flex flex-col'>
            <span className='text-sm font-medium'>Password</span>
            <div className='relative mt-1'>
              <input
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                type={showPassword ? 'text' : 'password'}
                placeholder='Create a password'
                className={`w-full p-2 rounded-md border pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  errors.password ? 'border-red-400' : 'border-gray-200'
                }`}
                aria-invalid={!!errors.password}
              />
              <button
                type='button'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                className='absolute right-2 top-1/2 -translate-y-1/2 p-1'
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <small className='text-red-600 mt-1'>{errors.password}</small>}
          </label>

          {/* Confirm Password */}
          <label className='flex flex-col'>
            <span className='text-sm font-medium'>Confirm password</span>
            <input
              name='confirmPassword'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder='Repeat your password'
              className={`mt-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
              }`}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <small className='text-red-600 mt-1'>{errors.confirmPassword}</small>
            )}
          </label>

          {/* Submit - full width */}
          <div className='sm:col-span-2 flex items-center justify-between mt-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    fill='none'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                  />
                </svg>
              ) : null}
              <span>{isSubmitting ? 'Submitting...' : 'Create account'}</span>
            </button>

            <button
              type='button'
              onClick={() => router.push('/login')}
              className='text-sm text-gray-600 underline'
            >
              Already have an account?
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
