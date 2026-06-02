import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is the Next.js 16 replacement for middleware.ts
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // We only care about protecting certain routes
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/whoisadmin');
    const isDashboardRoute = pathname.startsWith('/dashboard');

    if (!isAdminRoute && !isDashboardRoute) {
        return NextResponse.next();
    }

    // Attempt to get the session cookie we set in /api/auth/google/callback
    const sessionCookie = request.cookies.get('session')?.value;

    if (!sessionCookie) {
        // No session found, bounce them to login
        const url = new URL('/auth', request.url);
        url.searchParams.set('returnUrl', pathname);
        return NextResponse.redirect(url);
    }

    try {
        const session = JSON.parse(sessionCookie);
        const role = session.role;

        // If a customer tries to access admin routes, bounce them to their dashboard
        if (isAdminRoute && role !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Optional: If an admin tries to access a customer-only dashboard, bounce them to admin
        if (isDashboardRoute && role === 'admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }

    } catch (e) {
        // Corrupted session, bounce to login
        return NextResponse.redirect(new URL('/auth', request.url));
    }

    return NextResponse.next();
}

// Ensure the proxy/middleware only runs on specific paths to save compute!
export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/whoisadmin/:path*'],
};
