import mongoose, { connect } from 'mongoose';
import { DATABASE_URI, DB_NAME } from '../constants';
import { NextResponse } from 'next/server';
import { ApiError } from '@/utils/NextApiError';

export default async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    const instance = await connect(`${DATABASE_URI}/${DB_NAME}`);
    console.log('db connected: ', instance.connection.host);
    return instance.connection;
  } catch (error) {
    console.log(error);
    return NextResponse.json(new ApiError(500, 'Failed to connect DB'), { status: 500 });
  }
}
