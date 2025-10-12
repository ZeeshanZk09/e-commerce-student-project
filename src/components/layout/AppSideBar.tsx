'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Handbag, Heart, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import { PublicUser } from '@/types/userType';
import useGetUserSession from '@/lib/Helpers/useGetUserSession';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AppSidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const { user } = useGetUserSession(); // ✅ destructure properly (no setUser here)
  const [localUser, setLocalUser] = useState<PublicUser | null>(null);
  const router = useRouter();
  // ✅ Update local state only when user changes
  useEffect(() => {
    if (user) setLocalUser(user);
  }, [user]);

  const navigationLinks = [
    { id: 0, label: 'Home', link: '/' },
    { id: 1, label: 'About', link: '/about' },
    { id: 2, label: 'Categories', link: '/categories' },
    { id: 3, label: 'Contact Us', link: '/contact-us' },
    { id: 4, label: 'Help', link: '/help' },
  ];

  const ecommerceLinks = [
    { id: 0, label: 'Shop', link: '/shop', icon: <Handbag size={18} /> },
    { id: 1, label: 'Cart', link: '/cart', icon: <ShoppingCart size={18} /> },
    { id: 2, label: 'Favourites', link: '/favourites', icon: <Heart size={18} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        >
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className='w-72 sm:w-80 bg-white/90 dark:bg-[#111] shadow-2xl rounded-l-2xl p-6 flex flex-col justify-between'
          >
            {/* Header */}
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-lg font-semibold tracking-wide'>Zebotix</h2>
              <button
                onClick={() => setIsOpen(false)}
                className='p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition'
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className='flex flex-col gap-5'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>Menu</h3>
              <ul className='flex flex-col gap-3'>
                {navigationLinks.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.link}
                      onClick={() => setIsOpen(false)}
                      className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm'
                    >
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* E-commerce Links */}
            <nav className='flex flex-col gap-5 mt-6'>
              <h3 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
                E-Commerce
              </h3>
              <ul className='flex flex-col gap-3'>
                {ecommerceLinks.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={p.link}
                      onClick={() => setIsOpen(false)}
                      className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm'
                    >
                      {p.icon}
                      {p.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Section */}
            <div className='border-t border-gray-200 dark:border-gray-800 pt-4 mt-6'>
              <ul className='flex flex-col gap-3'>
                {localUser ? (
                  <li className='flex items-center gap-3'>
                    <Image
                      onClick={() => router.push('/profile')}
                      src={localUser.profilePic?.secure_url || '/default-profile.png'}
                      alt='Profile Picture'
                      width={40}
                      height={40}
                      className='w-10 h-10 rounded-full p-2 border object-cover'
                    />
                    <span className='text-sm font-medium'>{localUser.username}</span>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link
                        href='/auth/login'
                        onClick={() => setIsOpen(false)}
                        className='block text-sm p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition'
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/auth/register'
                        onClick={() => setIsOpen(false)}
                        className='block text-sm p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition'
                      >
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
