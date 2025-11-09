import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * OAuth Initiation Route
 * Redirects user to Google's OAuth consent screen
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Initiating OAuth flow...");
    console.log("Client ID:", process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...");
    console.log("Redirect URI:", process.env.GOOGLE_REDIRECT_URI);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Generate the URL for Google's OAuth consent screen
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline", // Get refresh token
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
      prompt: "consent", // Force consent screen to always get refresh token
    });

    console.log("Generated auth URL:", authUrl);

    // Use Response.redirect for external URLs
    return Response.redirect(authUrl, 302);
  } catch (error: any) {
    console.error("Error initiating OAuth:", error);
    
    // Redirect back to home with error
    const errorUrl = new URL("/", request.url);
    errorUrl.searchParams.set("error", "oauth_init_error");
    errorUrl.searchParams.set("message", error.message || "Failed to initiate OAuth");
    return NextResponse.redirect(errorUrl);
  }
}
