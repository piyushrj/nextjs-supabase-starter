import { updateSession } from '@/utils/supabase/middleware'
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const { response, user } = await updateSession(
        request,
    );

    // if user is logged in and visits the login page, redirect to the home page
    if (user && request.nextUrl.pathname === '/login') {
        // redirect to the home page
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // check if the user is logged in
    if (!request.nextUrl.pathname.endsWith('/login') && !user) {
        // no user, redirect the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }



    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
