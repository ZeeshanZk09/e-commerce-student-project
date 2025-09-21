import connectDB from '@/lib/db/connect';
import User from '@/lib/models/User';
import { TypeUser } from '@/types/userType';
import { ApiError } from '@/utils/NextApiError';
import { NextResponse } from 'next/server';

async function existingUser(email: string, username: string, phone: string) {
  await connectDB();
  const user = await User.findOne({
    $or: [{ email }, { username }, { phone }],
  });

  if (!user) {
    return null;
  }

  return user;
}

export { existingUser };
