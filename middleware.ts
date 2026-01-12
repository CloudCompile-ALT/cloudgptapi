import { NextRequest, NextResponse } from "next/server";

// API routes that use API key authentication instead of session
const isApiKeyRoute = (path: string) => {
  return path.startsWith("/v1") || 
         path.startsWith("/api/keys") || 
         path.startsWith("/api/video") || 
         path.startsWith("/api/image");
};

const isProtectedRoute = (path: string) => {
  return path.startsWith("/dashboard");
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for API routes - they use API key authentication
  if (isApiKeyRoute(pathname)) {
    return NextResponse.next();
  }

  // For protected routes, we'll handle authentication in the server components
  // using getLogtoContext for now, as it's more reliable in Next.js App Router
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Include v1 API routes
    '/v1(.*)',
  ],
};
