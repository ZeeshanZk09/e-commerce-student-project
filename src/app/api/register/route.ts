import { existingUser } from '@/helpers/authHelper';
import User from '@/lib/models/User';
import { TypeUser } from '@/types/userType';
import { ApiError } from '@/utils/NextApiError';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { NextRequest, NextResponse } from 'next/server';

export default async function POST(req: NextRequest, res: NextResponse) {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type headers', status: 400 });
  }

  const { firstName, lastName, username, email, password, phone, provider, uploads }: TypeUser =
    await req.json();
  // logic
  if (!firstName || !username || !email || !password || !phone || !provider) {
    return NextResponse.json(new ApiError(400, 'All fields are required'));
  }

  const user = await existingUser(email, username, phone);
  if (user) {
    return NextResponse.json(new ApiError(400, 'User already exists.'), { status: 400 });
  }

  const createdUser = await User.create({
    firstName,
    lastName: lastName || '',
    username,
    email,
    password,
    phone,
    provider,
    uploads: uploads || [],
  });

  const response = NextResponse.json(
    new ApiSuccess(createdUser, 201, { message: 'User created successfully.' }),
    { status: 201 }
  );

  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return response;
}
