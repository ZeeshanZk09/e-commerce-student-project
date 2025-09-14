import mongoose, { connect } from 'mongoose';
import { DATABASE_URI, DB_NAME } from './constants';
import { NextResponse } from 'next/server';

export default async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    const instance = await connect(`${DATABASE_URI!}/${DB_NAME}`);
    console.log(instance.connection.host);
    return instance.connection;
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'failed to connect db', status: 500 });
  }
}
