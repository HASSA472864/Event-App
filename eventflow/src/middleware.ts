import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: { signIn: "/auth/login" },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/create",
    "/events/:id/manage/:path*",
    "/events/:id/attendees/:path*",
    "/events/:id/checkin/:path*",
    "/events/:id/analytics/:path*",
    "/calendar/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
}
