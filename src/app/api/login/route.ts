import connectDB from '@/lib/db/connect';
import User from '@/lib/models/User';
import { LoginUserInput, PublicUser } from '@/types/userType';
import generateToken from '@/utils/generateToken';
import { ApiError } from '@/utils/NextApiError';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    if (req.headers.get('Content-Type') !== 'application/json') {
      return NextResponse.json({ error: 'Invalid content type headers', status: 400 });
    }
    const data: LoginUserInput = await req.json();
    console.log(data);
    if ((!data.username && !data.email && !data.phone) || !data.password) {
      return NextResponse.json(new ApiError(400, 'All fields are required'));
    }

    await connectDB();
    const user: PublicUser | null = await User.findOne({
      $or: [
        { email: data.email.trim().toLowerCase() },
        { username: data.username.trim().toLowerCase() },
        { phone: data.phone.trim().toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(new ApiError(404, 'User not exists'), { status: 404 });
    }

    let response = NextResponse.json(
      new ApiSuccess(user, 201, { message: 'User LoggedIn successfully.' }),
      { status: 201 }
    );

    const token = (await generateToken(user._id)) as string;

    if (typeof token !== 'string') {
      console.log(token);
      return NextResponse.json(new ApiError(500, 'Something went wrong.'), { status: 500 });
    }

    response.headers.set('x-user-id', user._id.toString());

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(new ApiError(500, 'Something went wrong.'), { status: 500 });
  }
}
