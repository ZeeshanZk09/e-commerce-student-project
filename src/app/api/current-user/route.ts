import { ACCESS_TOKEN_SECRET } from '@/lib/constants';
import connectDB from '@/lib/db/connect';
import { ApiSuccess } from '@/utils/NextApiSuccess';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';
import { ApiError } from '@/utils/NextApiError';
import { IUserDocument, PublicUser } from '@/types/userType';
import mongoose from 'mongoose';

const isDev = process.env.NODE_ENV !== 'production';

function dbg(...args: any[]) {
  if (isDev) console.debug('[current-user]', ...args);
}

function mask(s?: string | null, head = 4, tail = 4) {
  if (!s) return s;
  if (s.length <= head + tail + 3) return '***';
  return `${s.slice(0, head)}...${s.slice(-tail)}`;
}

/** Build cookie string for Set-Cookie header (simple) */
function buildAccessTokenCookie(token: string) {
  const maxAge = 15 * 60; // 15 minutes
  const secure = process.env.NODE_ENV === 'production';
  const parts = [`token=${token}`, 'HttpOnly', 'Path=/', `Max-Age=${maxAge}`, 'SameSite=Strict'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

/** Convert various id shapes (string | { buffer: {...} } | {$oid}) -> hex string or null */
function normalizeIdShape(raw: any): string | null {
  if (!raw) return null;

  // already a string
  if (typeof raw === 'string') return raw;

  // MongoDB driver may have { $oid: '...' }
  if (typeof raw === 'object' && raw.$oid) return String(raw.$oid);

  // jose may encode Buffer-like object as { buffer: { '0': 12, '1': 34, ... } }
  if (typeof raw === 'object' && raw.buffer && typeof raw.buffer === 'object') {
    try {
      const bytes = Object.values(raw.buffer).map((v: any) => Number(v));
      return Buffer.from(bytes).toString('hex');
    } catch (err) {
      dbg('normalizeIdShape buffer -> failed to rebuild id', err);
      return null;
    }
  }

  // fallback: can't normalize
  return null;
}

/** Minimal sanitizer to remove secrets before returning/logging */
function sanitize(user: IUserDocument | null) {
  if (!user) return null;
  const obj = user.toJSON ? user.toJSON() : (user as any);
  const safe: any = {
    id: obj._id?.toString?.() ?? obj.id,
    username: obj.username,
    email: obj.email,
    phone: obj.phone,
    role: obj.role,
    provider: obj.provider ?? null,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    fullName: obj.fullName ?? (`${obj.firstName ?? ''} ${obj.lastName ?? ''}`.trim() || undefined),
  };
  return safe;
}

export async function GET(req: NextRequest) {
  const started = Date.now();
  dbg('START', req.url);

  try {
    const cookieToken = req.cookies.get('token')?.value?.toString() ?? null;
    const authHeader = req.headers.get('authorization') ?? null;
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const token = cookieToken ?? bearer;

    dbg('token present:', !!token, 'masked:', mask(token));

    if (!token) return NextResponse.json({ message: 'No token provided' }, { status: 401 });

    if (!ACCESS_TOKEN_SECRET) {
      dbg('missing ACCESS_TOKEN_SECRET');
      return NextResponse.json(new ApiError(500, 'Access token secret not set'), { status: 500 });
    }

    const secret = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
    const { payload } = await jwtVerify(token, secret);
    dbg('jwt payload:', { ...payload });

    // normalize id / username
    const rawId = (payload as any)?.id ?? (payload as any)?._id ?? null;
    const id = normalizeIdShape(rawId);
    const username = (payload as any)?.username ?? null;

    dbg('extracted id:', id, 'username:', username);

    // db
    await connectDB();

    let user: IUserDocument | null = null;
    if (id && mongoose.isValidObjectId(id)) {
      user = (await User.findById(id)) as IUserDocument | null;
    }
    if (!user && username) {
      user = (await User.findOne({ username })) as IUserDocument | null;
    }
    if (!user) {
      dbg('user not found');
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const safe = sanitize(user);
    dbg('user found (sanitized):', safe);

    const response = new ApiSuccess({ ...safe, isAdmin: user.role === 'Admin' } as any, 200);
    dbg('OK handled in', Date.now() - started, 'ms');
    return NextResponse.json(response, { status: 200 });
  } catch (err: any) {
    dbg('handler error:', err?.message ?? err);

    // detect expired token
    const isExpired =
      err?.code === 'ERR_JWT_EXPIRED' ||
      err?.name === 'JWTExpired' ||
      /expired/i.test(String(err?.message ?? ''));

    if (!isExpired) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // --- simple refresh flow (attempt) ---
    try {
      dbg('token expired — attempting refresh flow');
      const refreshToken = req.cookies.get('refreshToken')?.value?.toString() ?? null;
      if (!refreshToken) {
        dbg('no refreshToken cookie');
        return NextResponse.json({ message: 'Token expired' }, { status: 401 });
      }

      await connectDB();

      // find user by refreshToken (customize to your schema)
      let user = (await User.findOne({ refreshToken })) as IUserDocument | null;
      if (!user)
        user = (await User.findOne({ refreshTokens: refreshToken })) as IUserDocument | null;
      if (!user) {
        dbg('no user for refresh token');
        return NextResponse.json({ message: 'Token expired' }, { status: 401 });
      }

      // generate new access token (your instance method)
      let newAccessToken: string | undefined;
      if (typeof (user as any).generateAccessToken === 'function') {
        try {
          newAccessToken = await (user as any).generateAccessToken({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: user.role,
          } as PublicUser);
        } catch (e) {
          // fallback to no-arg call
          newAccessToken = await (user as any).generateAccessToken();
        }
      }

      if (!newAccessToken || typeof newAccessToken !== 'string') {
        dbg('failed to create new access token');
        return NextResponse.json({ message: 'Token expired' }, { status: 401 });
      }

      const setCookie = buildAccessTokenCookie(newAccessToken);
      const safe = sanitize(user);
      dbg('refresh success, returning new token cookie');

      return NextResponse.json(
        new ApiSuccess({ ...safe, isAdmin: user.role === 'Admin' } as any, 200),
        {
          status: 200,
          headers: { 'Set-Cookie': setCookie },
        }
      );
    } catch (refreshErr: any) {
      dbg('refresh flow failed', refreshErr);
      return NextResponse.json({ message: 'Token expired' }, { status: 401 });
    }
  }
}
