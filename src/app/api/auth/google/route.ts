import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
        console.error("Missing Google OAuth environment variables in route.ts");
        return NextResponse.redirect(new URL('/auth?error=ConfigurationError', 'https://salaf.bd').toString());
    }
    const scope = "openid profile email";
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    
    return NextResponse.redirect(googleAuthUrl);
}
