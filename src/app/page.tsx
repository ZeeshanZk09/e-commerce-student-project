import Logout from '@/components/Logout';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <span>
        welcome and go to this page to register
        <Link href={'/register'} className='text-blue-600 underline'>
          register
        </Link>
      </span>
      <br />
      <Logout />
    </div>
  );
}
