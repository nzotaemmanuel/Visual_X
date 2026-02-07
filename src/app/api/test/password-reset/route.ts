import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/app/actions/passwordReset';

export async function POST(request: NextRequest) {
  // Dev-only helper to trigger password reset and see logged link
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Not allowed in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = body?.email;
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const result = await requestPasswordReset({ email });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Test password-reset endpoint error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}
