import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for a session cookie we will set during login
    const session = request.cookies.get('auth-token');

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
    const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

    // 1. If trying to access dashboard without a session, redirect to login
    if (isDashboardPage && !session) {
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    // 2. If already logged in and trying to access auth pages, redirect to dashboard
    if (isAuthPage && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
};