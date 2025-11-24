import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized({ req, token }) {
            const path = req.nextUrl.pathname

            // Admin only routes
            if (path.startsWith("/admin")) {
                return token?.role === "ADMIN"
            }

            // Protected routes
            if (path.startsWith("/dashboard") || path.startsWith("/games")) {
                return !!token
            }

            return true
        },
    },
})

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*", "/games/:path*"],
}
