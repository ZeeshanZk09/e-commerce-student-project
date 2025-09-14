'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default async function Home() {
  const [data, setData] = useState<any>(null);
  const res = await fetch('/api/register');
  const response = res.json();
  setData(response);
  // useEffect(() => {
  //   async function fetchData() {

  //   }
  // }, [])
  return (
    <div>
      <span>{data?.username}</span>
    </div>
  );
}
