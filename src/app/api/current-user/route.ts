import { ACCESS_TOKEN_SECRET } from '@/lib/constants';
import User from '@/lib/models/User';
// import { verifyAccessToken } from '@/utils/generateToken';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { jwtVerify } from 'jose';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
const jose = await import('jose');
const accessToken = jose.base64url.decode(ACCESS_TOKEN_SECRET);

export async function GET() {
  try {
    const userId = (await headers()).get('x-user-id');

    // const cookieStore = await cookies();

    // const token = cookieStore.get('token');

    if (!userId) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const user = await User.findById(userId);

    // const data = await jwtVerify(token.value, accessToken);

    // if (!data) {
    //   return new Response(JSON.stringify({ message: 'Unauthorized' }), {
    //     status: 401,
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });
    // }
    return NextResponse.json(new ApiSuccess(user, 200), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
