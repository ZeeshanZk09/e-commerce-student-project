'use client';
import toastService from '@/lib/services/toastService';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Logout() {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/logout', {
        // withcredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response);
      const data = JSON.parse(response.data);

      if (!response.data.success) {
        console.log(response.data, typeof response.data);
        toastService.error(data.error.message);
      }

      toastService.success(
        (typeof response.data.data !== 'string' && response.data.data) ?? 'Logout successfully'
      );
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.log(error);
      toastService.error((typeof error.status !== 'string' && error.status) ?? 'Failed to Logout');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
