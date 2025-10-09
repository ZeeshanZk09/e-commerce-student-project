import { ApiError } from '@/utils/NextApiError';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const cookie = await cookies();

    const token = cookie.get('token');
    if (!token) {
      return NextResponse.json(new ApiError(400, 'Unauthorized, Invalid token.'));
    }

    cookie.delete(token.name);

    return NextResponse.json(new ApiSuccess('Logout successfully', 200));
  } catch (error: any) {
    console.log('Logout error: ', error);
    return NextResponse.json(
      new ApiError(
        ((typeof error.status !== 'string' || 'number') && error.status) ?? 400,
        (typeof error.status !== 'string' && error.message) ?? 'Somthing went wrong while logout.'
      )
    );
  }
}
