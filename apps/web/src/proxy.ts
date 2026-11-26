import { NextResponse, type NextRequest } from 'next/server';

// Оптимістична перевірка: без cookie персоналу одразу на сторінку входу.
// Справжню перевірку токена й ролі робить API на кожен запит.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin/login')) return NextResponse.next();
  if (!request.cookies.has('kremen_admin')) {
    const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
