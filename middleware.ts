import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

// Routes that require specific roles
const ROLE_RESTRICTED_ROUTES: Record<string, string[]> = {
  '/staff': ['ADMIN', 'ENFORCEMENT_OFFICER'],
  '/enforcement': ['ENFORCEMENT_OFFICER', 'ADMIN'],
  '/settings/users': ['ADMIN'],
  '/revenue': ['ANALYST', 'ADMIN'],
  '/reports': ['ANALYST', 'ADMIN'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.includes('.') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname === '/laspa-logo.png'
  ) {
    return NextResponse.next();
  }

  // Check for access token in cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const decoded = await jwtVerify(accessToken, secret);

    const user = decoded.payload as any;

    // Check role-based access
    const allowedRoles = ROLE_RESTRICTED_ROUTES[pathname];
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // User doesn't have required role - redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check for inactivity timeout (30 minutes)
    const lastActiveAt = user.lastActiveAt ? parseInt(user.lastActiveAt as string) : Date.now();
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    if (lastActiveAt < thirtyMinutesAgo) {
      // Session expired due to inactivity - clear tokens and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // Token verification failed - redirect to login
    console.error('Token verification failed:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|laspa-logo.png|.*\\.svg|.*\\.png|.*\\.jpg).*)'],
};
