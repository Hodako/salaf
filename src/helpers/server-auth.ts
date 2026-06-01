import { cookies } from "next/headers";
import { User } from "@/models";
import { dbConnect } from "./db";

import { IAuthUser } from "@/types";

/**
 * Retrieves the currently authenticated user from the session cookie.
 * In development mode (NODE_ENV=development), auth is bypassed automatically.
 * 
 * @returns A promise that resolves to the user's authentication data (uid) or null if not authenticated.
 */
export async function getCurrentUser(): Promise<IAuthUser | null> {
    // ── Development bypass ──────────────────────────────────────────────────────
    // When running in dev mode, skip auth so the admin panel is accessible
    // without a Firebase login. Remove this before deploying to production.
    if (process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true') {
        return { uid: 'dev-bypass-uid' };
    }
    // ────────────────────────────────────────────────────────────────────────────

    try {
        const cookieStore = await cookies();
        const session = cookieStore.get('session');

        if (!session?.value) return null;

        const parsed = JSON.parse(session.value);
        if (parsed && parsed.uid) {
            return { uid: parsed.uid };
        }
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Checks if the currently authenticated user has administrative privileges.
 * In development mode (NODE_ENV=development), this always returns true.
 * 
 * @returns A promise that resolves to true if the user is an admin, false otherwise.
 */
export async function isAdmin(): Promise<boolean> {
    // ── Development bypass ──────────────────────────────────────────────────────
    if (process.env.NODE_ENV === 'development' || process.env.DEV_ADMIN_BYPASS === 'true') {
        return true;
    }
    // ────────────────────────────────────────────────────────────────────────────

    try {
        const auth = await getCurrentUser();
        if (!auth) return false;

        await dbConnect();
        const user = await User.findOne({ firebaseUid: auth.uid });
        return user?.role === 'admin';
    } catch (error) {
        return false;
    }
}
