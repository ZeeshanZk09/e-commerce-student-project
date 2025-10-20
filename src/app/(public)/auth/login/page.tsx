'use client';

import React, { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toastService from '@/lib/services/toastService';
import type { LoginUserInput } from '@/types/userType';

/**
 * Login form with two fields:
 * - identifier (username | email | phone)
 * - password
 *
 * It detects identifier type and sends payload accordingly:
 * { email, password } OR { phone, password } OR { username, password }
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d+\-\s()]{7,20}$/;

export default function Login() {
  const router = useRouter();
  const idRef = useRef<HTMLInputElement | null>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  function detectIdentifierType(value: string): 'email' | 'phone' | 'username' {
    if (emailRegex.test(value.trim())) return 'email';
    if (phoneRegex.test(value.trim())) return 'phone';
    return 'username';
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter username, email or phone.';
    } else {
      if (emailRegex.test(identifier.trim()) === false && identifier.includes('@')) {
        newErrors.identifier = 'Looks like an invalid email.';
      } else if (
        phoneRegex.test(identifier.trim()) === false &&
        /^[\d\+\-\s()]+$/.test(identifier.trim())
      ) {
        // if it's numeric-ish but fails phone regex
        newErrors.identifier = 'Looks like an invalid phone number.';
      }
    }

    if (!password) newErrors.password = 'Enter your password.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      toastService.error('Please fix the errors and try again.');
      return;
    }

    setLoading(true);
    try {
      const idType = detectIdentifierType(identifier.trim());
      const payload: Partial<LoginUserInput> & { password: string } =
        idType === 'email'
          ? { email: identifier.trim(), password }
          : idType === 'phone'
          ? { phone: identifier.trim(), password }
          : { username: identifier.trim(), password };

      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // include cookies if your API sets them
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          (data && (data.error?.message || data.message)) || res.statusText || 'Login failed';
        toastService.error(message);
        setLoading(false);
        return;
      }

      toastService.success('Logged in — redirecting...');
      // update any client-side session store if you have one (optional)
      // e.g. sessionStore.setLocal(data?.data || null)

      // redirect to profile or intended page
      router.push('/profile');
    } catch (err: any) {
      console.error('Login error', err);
      toastService.error(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className='p-6 mx-auto max-w-md'>
      <form
        onSubmit={handleSubmit}
        className='text-black bg-white/95 shadow-md rounded-lg p-6'
        noValidate
      >
        <h2 className='text-xl font-semibold mb-4'>Sign in</h2>

        <label htmlFor='identifier' className='block text-sm font-medium text-gray-700 mb-1'>
          Username, email or phone
        </label>
        <input
          ref={idRef}
          id='identifier'
          name='identifier'
          type='text'
          autoComplete='username'
          placeholder='e.g. you@example.com or +92 3XX XXX XXXX or username'
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setErrors((p) => ({ ...p, identifier: undefined }));
          }}
          className={`w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            errors.identifier
              ? 'border-red-400 focus:ring-red-200'
              : 'border-gray-200 focus:ring-sky-200'
          }`}
          aria-invalid={!!errors.identifier}
          aria-describedby={errors.identifier ? 'identifier-error' : undefined}
        />
        {errors.identifier && (
          <p id='identifier-error' className='text-sm text-red-600 mt-1'>
            {errors.identifier}
          </p>
        )}

        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mt-4 mb-1'>
          Password
        </label>
        <div className='relative'>
          <input
            id='password'
            name='password'
            type={showPassword ? 'text' : 'password'}
            autoComplete='current-password'
            placeholder='Enter your password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((p) => ({ ...p, password: undefined }));
            }}
            className={`w-full p-2 rounded-md border pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.password
                ? 'border-red-400 focus:ring-red-200'
                : 'border-gray-200 focus:ring-sky-200'
            }`}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
          <button
            type='button'
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className='absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-50'
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p id='password-error' className='text-sm text-red-600 mt-1'>
            {errors.password}
          </p>
        )}

        <div className='flex items-center justify-between mt-4'>
          <button
            type='submit'
            disabled={loading}
            className='px-4 py-2 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-60'
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <button
            type='button'
            onClick={() => router.push('/forgot-password')}
            className='text-sm text-gray-600 underline'
          >
            Forgot?
          </button>
        </div>

        <p className='text-xs text-gray-500 mt-3'>
          You can login with <strong>username</strong>, <strong>email</strong> or{' '}
          <strong>phone</strong>.
        </p>
      </form>
    </section>
  );
}
