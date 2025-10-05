import connectDB from '@/lib/db/connect';
import User from '@/lib/models/User';
import { CreateUserInput, IUserBase, PublicUser } from '@/types/userType';
import generateToken from '@/utils/generateToken';
import { ApiError } from '@/utils/NextApiError';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { cookies, headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    if (req.headers.get('Content-Type') !== 'application/json') {
      return NextResponse.json({ error: 'Invalid content type headers', status: 400 });
    }
    const data: CreateUserInput = await req.json();
    // const user = await existingUser(data, 'register');
    console.log(data);
    debugger;
    const user = await User.findOne({
      $or: [
        { email: data.email.trim().toLowerCase() },
        { username: data.username.trim().toLowerCase() },
        { phone: data.phone.trim().toLowerCase() },
      ],
    });

    if (user) {
      return NextResponse.json(new ApiError(400, 'User already exists.'), { status: 400 });
    }

    await connectDB();
    const createdUser = await User.create(data);

    const safeUser: Omit<PublicUser, 'password'> = createdUser;
    let response = NextResponse.json(
      new ApiSuccess(safeUser, 201, { message: 'User created successfully.' }),
      { status: 201 }
    );

    const token = (await generateToken(createdUser._id)) as string;

    // response.cookies.set('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    // });

    const header = await headers();
    header.set('x-user-id', safeUser._id.toString());

    const cookieStore = await cookies();

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.log(error);
    return NextResponse.json(new ApiError(500, 'Something went wrong.'), { status: 500 });
  }
}
