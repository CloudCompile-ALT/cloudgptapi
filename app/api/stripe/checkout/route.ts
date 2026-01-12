import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ error: 'This endpoint has been moved to /api/stripe/create-checkout-session' }, { status: 301 });
}
