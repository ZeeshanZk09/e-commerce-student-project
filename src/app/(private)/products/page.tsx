'use client';
import React, { useEffect, useState } from 'react';

export default function Products() {
  const [products, setProducts] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('https://dummyjson.com/products');
      const data = await response.json();
      setProducts(data);
    }
    fetchData();
  }, []);
  console.log(products);

  return <div></div>;
}
