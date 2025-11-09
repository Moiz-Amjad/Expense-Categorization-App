import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * OAuth Callback Route
 * Handles the redirect from Google after user authorizes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle user denial
    if (error) {
      return NextResponse.redirect(
        new URL(
          `/?error=oauth_denied&message=${encodeURIComponent(
            "You denied access to Gmail"
          )}`,
          request.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(
          `/?error=oauth_error&message=${encodeURIComponent(
            "No authorization code received"
          )}`,
          request.url
        )
      );
    }

    // Exchange authorization code for tokens
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    // In a real app, you'd store these tokens securely (database, encrypted cookie, etc.)
    // For now, we'll pass them as URL params to demonstrate the flow
    // WARNING: This is NOT secure for production - tokens should be encrypted and stored server-side
    
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("gmail_connected", "true");
    redirectUrl.searchParams.set("access_token", tokens.access_token || "");
    
    if (tokens.refresh_token) {
      redirectUrl.searchParams.set("refresh_token", tokens.refresh_token);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/?error=oauth_callback_error&message=${encodeURIComponent(
          error.message || "Failed to complete OAuth"
        )}`,
        request.url
      )
    );
  }
}
