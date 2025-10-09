import { ACCESS_TOKEN_SECRET } from '@/lib/constants';
import connectDB from '@/lib/db/connect';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User'; // assuming you have this model
import { ApiError } from '@/utils/NextApiError';

export async function GET(req: NextRequest) {
  try {
    // ✅ 1. Get token from cookie or Authorization header
    const token = req.cookies.get('token')?.value.toString();
    // ?? req.headers.get('authorization')?.split(' ')[1]
    console.log(req.cookies.get('token'));

    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    if (!ACCESS_TOKEN_SECRET) {
      return NextResponse.json(new ApiError(500, 'Access token secret is not set in env.'), {
        status: 500,
      });
    }

    // ✅ 2. Verify token
    const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);

    console.log(secret, payload);

    // ✅ 3. Extract user ID from payload (no need for custom header)
    const userId = (payload as any).id;
    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.log(userId);

    // ✅ 4. Connect to DB and find user
    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // ✅ 5. Return success response
    return NextResponse.json(new ApiSuccess({ user }, 200), { status: 200 });
  } catch (error: any) {
    console.error('JWT verify error:', error);

    if (error.code === 'ERR_JWT_EXPIRED') {
      return NextResponse.json({ message: 'Token expired' }, { status: 401 });
    }

    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
