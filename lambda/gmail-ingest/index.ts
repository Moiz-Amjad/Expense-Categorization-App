import { Handler } from "aws-lambda";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { google } from "googleapis";

const s3Client = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

interface GmailIngestEvent {
  userId: string;
  accessToken: string;
  refreshToken?: string;
}

interface GmailIngestResponse {
  statusCode: number;
  body: string;
}

/**
 * Lambda handler for Gmail expense ingestion
 * Fetches emails from Gmail API and saves to S3
 */
export const handler: Handler<GmailIngestEvent, GmailIngestResponse> = async (
  event
) => {
  try {
    const { userId, accessToken, refreshToken } = event;

    if (!userId || !accessToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Missing required parameters: userId and accessToken",
        }),
      };
    }

    console.log(`Processing Gmail request for user: ${userId}`);

    // Set up OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Initialize Gmail API
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Fetch emails from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const timestamp = Math.floor(thirtyDaysAgo.getTime() / 1000);

    // Query for potential transaction emails
    const query = `after:${timestamp} (from:*amazon* OR from:*uber* OR from:*starbucks* OR from:*receipt* OR from:*order* OR subject:receipt OR subject:order OR subject:invoice OR subject:payment)`;

    console.log(`Fetching emails with query: ${query}`);

    // List messages
    const listResponse = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: 50, // Limit to 50 most recent transaction emails
    });

    const messages = listResponse.data.messages || [];
    console.log(`Found ${messages.length} potential transaction emails`);

    // Fetch full details for each email
    const emailDetails = await Promise.all(
      messages.map(async (message) => {
        const details = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
          format: "full",
        });

        const payload = details.data.payload;
        const headers = payload?.headers || [];

        // Extract header information
        const getHeader = (name: string) =>
          headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || "";

        return {
          id: details.data.id,
          threadId: details.data.threadId,
          subject: getHeader("Subject"),
          from: getHeader("From"),
          to: getHeader("To"),
          date: getHeader("Date"),
          snippet: details.data.snippet,
          labelIds: details.data.labelIds || [],
        };
      })
    );

    const emailData = {
      userId,
      fetchedAt: new Date().toISOString(),
      emailCount: emailDetails.length,
      emails: emailDetails,
    };

    // Save to S3
    const bucketName = process.env.S3_BUCKET_NAME;
    
    if (!bucketName) {
      console.error("S3_BUCKET_NAME not configured");
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "S3 bucket not configured",
        }),
      };
    }

    console.log(`Saving ${emailDetails.length} emails to S3 bucket: ${bucketName}`);
    const s3Timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const s3Key = `gmail-inbox/${userId}/${s3Timestamp}.json`;

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: JSON.stringify(emailData),
      ContentType: "application/json",
    });

    await s3Client.send(putCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Gmail data successfully ingested to S3",
        emailCount: emailDetails.length,
        s3Location: `s3://${bucketName}/${s3Key}`,
      }),
    };
  } catch (error: any) {
    console.error("Error in Lambda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to process Gmail request",
        details: error.message,
      }),
    };
  }
};
