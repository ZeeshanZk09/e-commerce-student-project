import { existingUser } from '@/helpers/authHelper';
import User from '@/lib/models/User';
import { CreateUserInput, IUserBase, PublicUser } from '@/types/userType';
import generateToken from '@/utils/generateToken';
import { ApiError } from '@/utils/NextApiError';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { NextRequest, NextResponse } from 'next/server';

export default async function POST(req: NextRequest, res: NextResponse) {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type headers', status: 400 });
  }
  const data: CreateUserInput = await req.json();
  const user = await existingUser(data, "register");

  if (user) {
    return NextResponse.json(new ApiError(400, 'User already exists.'), { status: 400 });
  }

  const createdUser = await User.create(data);
  
  const safeUser: Omit<CreateUserInput, 'password'> = createdUser;
  const response = NextResponse.json(
    new ApiSuccess(safeUser, 201, { message: 'User created successfully.' }),
    { status: 201 }
  );

  const token = await generateToken(createdUser._id);

  response.cookies.set('token', token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return response;
}
