'use client';
import Logout from '@/components/Logout';
import useGetUserSession from '@/lib/Helpers/useGetUserSession';
import { PublicUser } from '@/types/userType';
import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const { user: data, loading } = useGetUserSession();

  useEffect(() => {
    if (!data) {
      setUser(null);
      return;
    }
    setUser(data);
  }, [data]);

  if (loading) return <p>Loading...</p>;

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
