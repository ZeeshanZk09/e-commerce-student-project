import { Types } from 'mongoose';
import { NextResponse } from 'next/server';
import { ApiError } from './NextApiError';
import User from '@/lib/models/User';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/lib/constants';
import { jwtVerify } from 'jose';
import connectDB from '@/lib/db/connect';
import { IUserDocument } from '@/types/userType';

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET environment variables');
}

const accessToken = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
const refreshToken = new TextEncoder().encode(REFRESH_TOKEN_SECRET);

export default async function generateToken(
  id: Types.ObjectId
): Promise<{ accessToken: string; refreshToken: string } | NextResponse<ApiError> | null> {
  try {
    // if (!id) return NextResponse.json(new ApiSuccess(null, 400, { message: 'User ID is required.' }))
    if (!id)
      return NextResponse.json(
        new ApiError(400, 'User ID is required.', { message: 'User ID is required.' }, true)
      );

    await connectDB();
    const user = (await User.findById(id)) as IUserDocument;

    if (!user)
      return NextResponse.json(
        new ApiError(404, 'User not found.', { message: 'User not found.' }, true)
      );

    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      return NextResponse.json(
        new ApiError(500, 'Internal server error.', { message: 'Internal server error.' }, true)
      );
    }

    let accessToken: string, refreshToken: string;
    // mistake, undefine, error
    try {
      accessToken = await user.generateAccessToken();
      refreshToken = await user.generateRefreshToken();
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        new ApiError(
          500,
          error instanceof Error ? error.message : 'Unknown error while generating token.',
          { message: 'Internal server error.' },
          true
        )
      );
    }

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        new ApiError(500, 'Failed to generate Tokens.', { message: 'Internal server error.' }, true)
      );
    }

    user.refreshToken = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {
    return null;
  }
}

// Verify access token
export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, accessToken);
    console.debug('Access token verified', { payload });
    return { payload, valid: true };
  } catch (error) {
    console.warn('Access token verification failed', { error: String(error), token });
    return { error, valid: false };
  }
}

// Verify refresh token
export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, refreshToken);
    console.debug('Refresh token verified', { payload });
    return { payload, valid: true };
  } catch (error) {
    console.warn('Refresh token verification failed', { error: String(error), token });
    return { error, valid: false };
  }
}
