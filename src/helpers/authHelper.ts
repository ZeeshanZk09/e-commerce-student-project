import connectDB from '@/lib/db/connect';
import User from '@/lib/models/User';
import { CreateUserInput, IUserBase } from '@/types/userType';
import { ApiError } from '@/utils/NextApiError';
import { NextResponse } from 'next/server';

async function existingUser(data: CreateUserInput, type: string) {
  try {
    await connectDB();
    switch (type) {
      case 'register':
        if (!data.username || !data.email || !data.password || !data.phone) {
          return NextResponse.json(new ApiError(400, 'All fields are required'));
        }
        break;
      case 'login':
        if ((!data.username && !data.email && !data.phone) || !data.password) {
          return NextResponse.json(new ApiError(400, 'All fields are required'));
        }
        break;
      default:
        break;
    }

    const where =
      data.username && data.email && data.phone
        ? {
            $or: [
              { email: data.email.trim().toLowerCase() },
              { username: data.username.trim().toLowerCase() },
              { phone: data.phone.trim().toLowerCase() },
            ],
          }
        : data.username && data.email
        ? {
            $or: [
              { username: data.username.trim().toLowerCase() },
              { email: data.email.trim().toLowerCase() },
            ],
          }
        : data.username && data.phone
        ? {
            $or: [
              { username: data.username.trim().toLowerCase() },
              { phone: data.phone.trim().toLowerCase() },
            ],
          }
        : data.email && data.phone
        ? {
            $or: [
              { email: data.email.trim().toLowerCase() },
              { phone: data.phone.trim().toLowerCase() },
            ],
          }
        : data.username
        ? { username: data.username.trim().toLowerCase() }
        : data.phone
        ? { phone: data.phone.trim().toLowerCase() }
        : { email: data.email.trim().toLowerCase() };

    console.log('ExistingUser Query:', JSON.stringify(where)); // Log the query for debugging

    const user = await User.findOne(where);

    if (!user) {
      console.log('No existing user found.');
      return null;
    }

    console.log('Existing user found:', {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
    }); // Log non-sensitive user details

    return user;
  } catch (error) {
    console.error('ExistingUser Error:', error); // Use console.error for better visibility
    return NextResponse.json(new ApiError(500, 'Internal server error'), { status: 500 });
  }
}

export { existingUser };
