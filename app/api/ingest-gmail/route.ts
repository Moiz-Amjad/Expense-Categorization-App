import { NextRequest, NextResponse } from "next/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

// Initialize Lambda client
const lambdaClient = new LambdaClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Get userId and OAuth tokens from request body
    const body = await request.json();
    const userId = body.userId || "amplify-user";
    const accessToken = body.accessToken;
    const refreshToken = body.refreshToken;

    const lambdaPayload = {
      userId,
      accessToken,
      refreshToken,
    };

    // Invoke Lambda function
    const command = new InvokeCommand({
      FunctionName: process.env.GMAIL_INGEST_LAMBDA_NAME || "gmail-ingest-lambda",
      Payload: JSON.stringify(lambdaPayload),
    });

    const lambdaResponse = await lambdaClient.send(command);
    const responsePayload = JSON.parse(
      new TextDecoder().decode(lambdaResponse.Payload)
    );

    // Parse Lambda response
    const lambdaResult = JSON.parse(responsePayload.body);

    return NextResponse.json({
      success: true,
      data: lambdaResult,
    });
  } catch (error: any) {
    console.error("Error invoking Gmail ingest Lambda:", error);
    return NextResponse.json(
      {
        error: "Failed to ingest Gmail data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
