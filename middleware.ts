import { clerkMiddleware, auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, req) => {
  const protectedRoutes = ['/dashboard'];
  const { userId } = await auth();

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'], // Matches all routes except static files
};
