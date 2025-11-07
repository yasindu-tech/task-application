import { type NextRequest } from "next/server"
import { updateSession } from "./lib/supabase/middleware"

// Run updateSession for incoming requests so unauthenticated users are redirected
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Exclude next internals and static assets from the middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
}
