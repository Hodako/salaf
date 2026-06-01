import { NextResponse } from "next/server";
import crypto from "crypto";

const SECRET = process.env.NEXTAUTH_SECRET || "captcha-secret-123";

export async function GET() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const sum = num1 + num2;

    // Create a signature/token for this challenge
    const expires = Date.now() + 1000 * 60 * 5; // 5 minutes
    const tokenData = JSON.stringify({ sum, expires });
    const hmac = crypto.createHmac("sha256", SECRET).update(tokenData).digest("hex");
    const token = Buffer.from(JSON.stringify({ data: tokenData, hmac })).toString("base64");

    // Generate an SVG for the question (to make it harder to scrape)
    const svg = `
        <svg width="150" height="50" viewBox="0 0 150 50" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="transparent" />
            <text x="10" y="35" font-family="Arial" font-size="24" fill="#c06b40" font-weight="bold" style="user-select: none;">
                ${num1} + ${num2} = ?
            </text>
            <path d="M 0 ${Math.random() * 50} L 150 ${Math.random() * 50}" stroke="#c06b4022" stroke-width="2" />
            <path d="M 0 ${Math.random() * 50} L 150 ${Math.random() * 50}" stroke="#c06b4011" stroke-width="1" />
        </svg>
    `.trim();

    return NextResponse.json({
        captcha: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
        token
    });
}

/**
 * Utility to verify captcha in other routes
 */
export function verifyCaptcha(token: string, answer: string | number) {
    try {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString());
        const { data, hmac: receivedHmac } = decoded;
        
        const expectedHmac = crypto.createHmac("sha256", SECRET).update(data).digest("hex");
        if (expectedHmac !== receivedHmac) return false;

        const { sum, expires } = JSON.parse(data);
        if (Date.now() > expires) return false;
        
        return parseInt(answer as string) === sum;
    } catch (e) {
        return false;
    }
}
