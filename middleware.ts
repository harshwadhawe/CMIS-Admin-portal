export function middleware() {
  //   return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
