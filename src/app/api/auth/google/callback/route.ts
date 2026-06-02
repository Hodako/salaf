import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbConnect } from '@/helpers';
import { User } from '@/models';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect('https://salaf.bd/auth?error=MissingCode');
        }

        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;

        if (!clientId || !clientSecret || !redirectUri) {
            console.error("Missing Google OAuth environment variables in callback");
            return NextResponse.redirect('https://salaf.bd/auth?error=ConfigurationError');
        }

        // 1. Exchange auth code for Google access token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            })
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error('Google token exchange error:', errText);
            return NextResponse.redirect('https://salaf.bd/auth?error=TokenExchangeFailed');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // 2. Fetch user details from Google userinfo API
        const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!userinfoResponse.ok) {
            return NextResponse.redirect('https://salaf.bd/auth?error=FetchUserinfoFailed');
        }

        const profile = await userinfoResponse.json();

        // 3. Connect to MongoDB and find/create user profile
        await dbConnect();

        let user = await User.findOne({
            $or: [{ firebaseUid: profile.sub }, { email: profile.email }]
        });

        if (user) {
            // Update profile info if missing
            let isModified = false;
            if (!user.firebaseUid) {
                user.firebaseUid = profile.sub;
                isModified = true;
            }
            if (!user.image && profile.picture) {
                user.image = profile.picture;
                isModified = true;
            }
            if (isModified) {
                await user.save();
            }
        } else {
            // Create a new user
            user = await User.create({
                email: profile.email,
                name: profile.name || 'Salaf User',
                image: profile.picture,
                firebaseUid: profile.sub,
                role: 'customer'
            });
        }

        // 4. Set Next.js HTTP-only session cookie
        const cookieStore = await cookies();
        cookieStore.set('session', JSON.stringify({ uid: user.firebaseUid, role: user.role, email: user.email }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
        });

        // 5. Redirect based on user privilege role
        const redirectUrl = user.role === 'admin' ? 'https://salaf.bd/admin/dashboard' : 'https://salaf.bd/dashboard';
        return NextResponse.redirect(redirectUrl);

    } catch (e) {
        console.error('Auth callback exception:', e);
        return NextResponse.redirect('https://salaf.bd/auth?error=InternalServerError');
    }
}
