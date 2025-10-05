'use client';
import { PublicUser } from '@/types/userType';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get('/api/current-user');

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser(null);
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
    </section>
  );
}
