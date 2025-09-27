import connectDB from '@/lib/db/connect';
import User from '@/lib/models/User';
import { CreateUserInput, IUserBase } from '@/types/userType';
import { ApiError } from '@/utils/NextApiError';
import { NextResponse } from 'next/server';

async function existingUser(data: CreateUserInput, type : string) {
  await connectDB();
  switch (type) {
    case "register":
      if (!data.username || !data.email || !data.password || !data.phone) {
          return NextResponse.json(new ApiError(400, 'All fields are required'));
      }  
      break;
    case "login":
      if ((!data.username && !data.email && !data.phone) || !data.password) {
        return NextResponse.json(new ApiError(400, 'All fields are required'));
      }
      break;
    default:
      break;
  }
    
  const user = await User.findOne({
    $or: [
      { email: data.email },
      { username: data.username },
      { phone: data.phone }
    ],
  });

  if (!user) {
    return null;
  }

  return user;
}

export { existingUser };
