import { NextRequest, NextResponse } from 'next/server';

export default function POST(req: NextRequest, res: NextResponse) {
  if (req.headers.get('Content-Type') !== 'application/json') {
    return NextResponse.json({ error: 'Invalid content type headers', status: 400 });
  }

  const { firstName, lastName, email, password } = req.body;
  // logic

  // create => db

  return {};
}
