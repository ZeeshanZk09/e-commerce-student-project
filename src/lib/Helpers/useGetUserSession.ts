'use client';
import { PublicUser } from '@/types/userType';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function useGetUserSession() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, status } = await axios.get('/api/auth/current-user', {
          withCredentials: true,
        });

        if (status >= 200 && status < 300 && data) {
          setUser(data);
        } else {
          setUser(null);
          router.push(`/login?redirect=${pathname}`);
        }
      } catch (error) {
        console.error('❌ Error fetching user session:', error);
        setUser(null);
        router.push(`/login?redirect=${pathname}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router]);

  return { user, loading };
}
