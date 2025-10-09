'use client';
import Logout from '@/components/Logout';
import { PublicUser } from '@/types/userType';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const router = useRouter();
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/current-user', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            // 'x-user-id',
          },
        });

        if (!(response.status >= 200 || response.status < 300)) {
          setUser(null);
          router.push('/login');
          return;
        }

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
        setTimeout(() => router.push('/login'), 2000);
        return;
      }
    }
    fetchData();
  }, []);

  console.log(user);

  return (
    <section>
      <h1>User Profile</h1>
      <div>
        <p>Username: {user?.username}</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>
      <Logout />
    </section>
  );
}
