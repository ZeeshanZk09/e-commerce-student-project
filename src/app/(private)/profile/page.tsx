'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logout from '@/components/Logout';
import useGetUserSession from '@/lib/Helpers/useGetUserSession';
import { PublicUser } from '@/types/userType';

function dbg(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') console.debug('[Profile]', ...args);
}

export default function Profile() {
  const router = useRouter();
  const { userData: rawUser, loading, revalidate, clearSession } = useGetUserSession();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // normalize user shape so component never gets surprised by wrapper/string
  const displayUser = useMemo(() => rawUser, [rawUser]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // derived values
  const initials = useMemo(() => {
    if (!displayUser) return 'U';
    const parts = [displayUser.firstName, displayUser.lastName].filter(Boolean);
    if (parts.length === 0 && displayUser.username)
      return displayUser.username.slice(0, 2).toUpperCase();
    return parts
      .map((p) => p![0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [displayUser]);

  const memberSince = useMemo(() => {
    if (!displayUser) return null;
    const raw = (displayUser as any).createdAt ?? (displayUser as any).created_at ?? null;
    const date = raw ? new Date(raw) : null;
    try {
      return date ? date.toLocaleDateString() : null;
    } catch {
      return null;
    }
  }, [displayUser]);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await revalidate();
      setCopyMessage('Refreshed');
      setTimeout(() => setCopyMessage(null), 1400);
    } catch (err) {
      dbg('handleRefresh -> failed', err);
      setCopyMessage('Refresh failed');
      setTimeout(() => setCopyMessage(null), 1800);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleCopy(text?: string | null) {
    if (!text) {
      setCopyMessage('Nothing to copy');
      setTimeout(() => setCopyMessage(null), 1200);
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage('Copied!');
      setTimeout(() => setCopyMessage(null), 1400);
    } catch (err) {
      dbg('handleCopy -> failed', err);
      setCopyMessage('Copy failed');
      setTimeout(() => setCopyMessage(null), 1400);
    }
  }

  function goToEdit() {
    router.push('/profile/edit');
  }

  function handleLogout() {
    // Clear local session; Logout component should handle server-side sign-out.
    clearSession();
    router.push('/auth/login');
  }

  // avoid hydration mismatch on server-rendered pages
  if (!mounted) return null;

  if (loading) {
    return (
      <section className='max-w-3xl mx-auto p-6'>
        <div className='animate-pulse bg-white/80 rounded-2xl shadow-sm p-6'>
          <div className='h-6 w-48 bg-gray-200 rounded mb-4' />
          <div className='flex items-center gap-4'>
            <div className='h-20 w-20 rounded-full bg-gray-200' />
            <div className='flex-1'>
              <div className='h-4 bg-gray-200 rounded w-3/4 mb-2' />
              <div className='h-4 bg-gray-200 rounded w-1/2' />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // not logged in
  if (!displayUser) {
    return (
      <section className='text-black max-w-3xl mx-auto p-6 text-center'>
        <div className='text-black bg-white/90 rounded-2xl shadow-sm p-8'>
          <h2 className='text-xl font-semibold mb-2'>No active session</h2>
          <p className='text-sm text-gray-600 mb-6'>
            You are not signed in. Please sign in to view your profile.
          </p>
          <div className='flex justify-center gap-3'>
            <button
              onClick={() => router.push('/auth/login')}
              className='px-4 py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700'
            >
              Sign in
            </button>
            <button
              onClick={() => router.push('/')}
              className='px-4 py-2 rounded-lg border bg-transparent text-gray-700 hover:bg-gray-50'
            >
              Go home
            </button>
          </div>
        </div>
      </section>
    );
  }

  // logged in UI
  return (
    <section className='max-w-3xl mx-auto p-6'>
      <div className='text-black bg-white/95 rounded-2xl shadow-md p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div
              className='h-20 w-20 rounded-full flex items-center justify-center text-xl font-semibold bg-sky-100 text-sky-700'
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <h1 className='text-2xl font-semibold'>{displayUser.username ?? 'User'}</h1>
              {memberSince && <p className='text-sm text-gray-600'>Member since: {memberSince}</p>}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className='inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-white hover:bg-gray-50'
              title='Refresh session'
              aria-disabled={isRefreshing}
            >
              {isRefreshing ? (
                <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24' fill='none' aria-hidden>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                    className='opacity-25'
                  />
                  <path
                    d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z'
                    fill='currentColor'
                    className='opacity-75'
                  />
                </svg>
              ) : (
                <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' aria-hidden>
                  <path
                    d='M21 12a9 9 0 11-3-6.5'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
              <span className='text-sm'>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={goToEdit}
              className='px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700'
            >
              Edit
            </button>

            <Logout />
          </div>
        </div>

        <div className='mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='p-4 rounded-lg border bg-white'>
            <h3 className='text-sm text-gray-500 mb-2'>Email</h3>
            <div className='flex items-center justify-between gap-3'>
              <div className='truncate text-sm'>{displayUser.email ?? '-'}</div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => handleCopy(displayUser.email ?? null)}
                  className='text-sm px-2 py-1 rounded-md border hover:bg-gray-50'
                  disabled={!displayUser.email}
                >
                  Copy
                </button>
                <span className='text-xs text-gray-400'>{copyMessage ?? ''}</span>
              </div>
            </div>
          </div>

          <div className='p-4 rounded-lg border bg-white'>
            <h3 className='text-sm text-gray-500 mb-2'>Phone</h3>
            <div className='flex items-center justify-between gap-3'>
              <div className='text-sm'>{displayUser.phone ?? '-'}</div>
              <button
                onClick={() => handleCopy(displayUser.phone ?? null)}
                className='text-sm px-2 py-1 rounded-md border hover:bg-gray-50'
                disabled={!displayUser.phone}
              >
                Copy
              </button>
            </div>
          </div>

          <div className='p-4 rounded-lg border bg-white'>
            <h3 className='text-sm text-gray-500 mb-2'>Role</h3>
            <div className='flex items-center gap-2'>
              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
                {displayUser.role ?? 'Customer'}
              </span>
              {displayUser.role === 'Admin' && (
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className='p-4 rounded-lg border bg-white'>
            <h3 className='text-sm text-gray-500 mb-2'>Account actions</h3>
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                onClick={() => router.push('/orders')}
                className='px-3 py-2 rounded-md bg-white border hover:bg-gray-50'
              >
                View orders
              </button>
              <button
                onClick={handleLogout}
                className='px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700'
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
