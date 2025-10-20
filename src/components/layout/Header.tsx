'use client';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import AppSideBar from './AppSideBar';

export default function Header() {
  const [open, setOpen] = React.useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Categories', href: '/categories' },
    { name: 'shop', href: '/shop' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className='p-4 flex justify-between '>
      <h2 className='w-full'>E - com</h2>
      <nav className='hidden md:block w-full'>
        <ul className='w-full flex justify-between'>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link href={link.href}>{link.name}</Link>
            </li>
          ))}
        </ul>
        <div className='flex space-x-4 justify-end'>
          <Link href={'/auth/login'}>Login</Link>
          <Link href={'/auth/register'}>Register</Link>
        </div>
      </nav>

      <button className='block md:hidden' onClick={() => setOpen(true)}>
        {<Menu />}
      </button>
      {open && <AppSideBar isOpen={open} setIsOpen={setOpen as any} />}
    </header>
  );
}
