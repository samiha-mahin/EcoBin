import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/utils/db/actions';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const user = await getUserByEmail(email);
  return NextResponse.json(user || null);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name } = body;

  if (!email || !name)
    return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });

  const user = await createUser(email, name);
  return NextResponse.json(user);
}
