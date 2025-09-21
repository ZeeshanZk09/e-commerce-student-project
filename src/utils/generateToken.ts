import { ObjectId } from 'mongoose';
import { NextResponse } from 'next/server';
import { ApiSuccess } from './NextApiSuccess';
import { ApiError } from './NextApiError';
import User from '@/lib/models/User';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '@/lib/constants';
import { unknown } from 'zod';

export default async function generateToken(id: ObjectId) {
  try {
    // if (!id) return NextResponse.json(new ApiSuccess(null, 400, { message: 'User ID is required.' }))
    if (!id)
      return NextResponse.json(
        new ApiError(400, 'User ID is required.', { message: 'User ID is required.' }, true)
      );

    const user = await User.findById(id);

    if (!user)
      return NextResponse.json(
        new ApiError(404, 'User not found.', { message: 'User not found.' }, true)
      );

    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      return NextResponse.json(
        new ApiError(500, 'Internal server error.', { message: 'Internal server error.' }, true)
      );
    }

    let accessToken, refreshToken;

    try {
      accessToken = user.generateAccessToken();
      refreshToken = user.generateRefreshToken();
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

    user. = refreshToken;
    await user.save();

    return { accessToken, refreshToken };
  } catch (error) {

  }
}
