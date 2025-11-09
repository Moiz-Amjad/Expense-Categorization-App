# Expense Management System - Technical Documentation

## 📖 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Setup & Installation](#setup--installation)
5. [How It Works](#how-it-works)
6. [Running the Application](#running-the-application)
7. [Project Structure](#project-structure)
8. [Key Components](#key-components)
9. [Environment Variables](#environment-variables)
10. [Troubleshooting](#troubleshooting)

---

## Overview

An AI-powered expense tracking system that automatically ingests transaction emails from Gmail, stores them in AWS S3, and will classify expenses using machine learning. Built with Next.js, AWS Lambda, and serverless architecture.

**Current Status**: Phase 4 Complete - Gmail integration working with OAuth authentication.

---

## Architecture

```
┌─────────────────┐
│   User Browser  │
│   (Next.js UI)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Amazon Cognito │ ◄─── User Authentication
└─────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     Next.js API Routes              │
│  - /api/auth/google                 │
│  - /api/auth/callback               │
│  - /api/ingest-gmail                │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│  Google OAuth 2.0       │ ◄─── Gmail API Access
└─────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│   AWS Lambda (gmail-ingest-lambda)   │
│   - Fetches Gmail emails via API     │
│   - Filters transaction emails       │
│   - Saves to S3                      │
└──────────┬───────────────────────────┘
           │
           ▼
┌─────────────────────────┐
│   Amazon S3             │
│   (gmail-expense-emails)│
│   - Stores email data   │
│   - JSON format         │
└─────────────────────────┘
```

---

## Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **AWS CLI** (configured with credentials)
- **Git**

### Required Accounts
- **AWS Account** with:
  - IAM user with programmatic access
  - Permissions for Lambda, S3, Cognito
- **Google Cloud Account** with:
  - Gmail API enabled
  - OAuth 2.0 credentials configured
- **GitHub Account** (for version control)

### AWS Services Used
- Amazon Cognito (User authentication)
- AWS Lambda (Gmail ingestion)
- Amazon S3 (Email storage)
- CloudWatch (Logging)
- IAM (Access control)

---

## Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Moiz-Amjad/Expense-Categorization-App.git
cd Expense-Categorization-App/exp-mgmt
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Lambda Dependencies
```bash
cd lambda/gmail-ingest
npm install
cd ../..
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory (you can copy from `.env.example`):

```bash
cp .env.example .env.local
```

Then fill in your actual values:

```bash
# AWS Cognito Configuration
NEXT_PUBLIC_AWS_USER_POOL_ID="your-user-pool-id"
NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID="your-client-id"
NEXT_PUBLIC_AWS_USER_DOMAIN="your-cognito-domain.auth.region.amazoncognito.com"

# AWS Configuration for Lambda
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
GMAIL_INGEST_LAMBDA_NAME=gmail-ingest-lambda

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

**Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

### 5. Deploy Lambda Function

#### Build the Lambda
```bash
cd lambda/gmail-ingest
npm run build
```

#### Create Deployment Package
```bash
cd dist
zip ../function.zip index.js
cd ..
cd node_modules
zip -r ../function.zip .
cd ..
```

#### Deploy to AWS
```bash
aws lambda update-function-code \
  --function-name gmail-ingest-lambda \
  --zip-file fileb://function.zip \
  --no-cli-pager
```

#### Configure Lambda Environment Variables
```bash
aws lambda update-function-configuration \
  --function-name gmail-ingest-lambda \
  --environment Variables="{
    GOOGLE_CLIENT_ID=your-client-id,
    GOOGLE_CLIENT_SECRET=your-secret,
    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback,
    S3_BUCKET_NAME=gmail-expense-emails-ma
  }" \
  --no-cli-pager
```

### 6. Create S3 Bucket
```bash
aws s3 mb s3://gmail-expense-emails-ma --region us-east-1
```

### 7. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback`
7. Copy Client ID and Client Secret to `.env.local`

---

## How It Works

### 1. User Authentication Flow

```
User clicks "Sign In" 
  → Amplify UI handles Cognito authentication
  → User enters credentials
  → Cognito returns JWT token
  → User redirected to dashboard
```

### 2. Gmail Connection Flow

```
User clicks "Connect Gmail" button
  → Redirects to /api/auth/google
  → Google OAuth consent screen
  → User grants Gmail access
  → Redirects to /api/auth/callback with auth code
  → Exchange code for access + refresh tokens
  → Tokens stored in React state
  → UI shows "Gmail Connected" badge
  → "Fetch Expenses" button becomes available
```

### 3. Email Ingestion Flow

```
User clicks "Fetch Expenses" button (only available after Gmail connected)
  → Button shows loading spinner ("Fetching...")
  → Frontend calls /api/ingest-gmail with tokens
  → API route invokes Lambda function
  → Lambda uses tokens to authenticate with Gmail
  → Gmail API query: transaction emails from last 30 days
  → Filter: from:*amazon*, *uber*, subject:receipt, etc.
  → Fetch up to 50 messages
  → Extract: subject, from, to, date, snippet
  → Save as JSON to S3: gmail-inbox/{userId}/{timestamp}.json
  → Return email count to frontend
  → Success message displayed in green box
  → Button returns to normal state
```

### 4. Data Storage Format

Emails are stored in S3 as JSON:
```json
{
  "userId": "04083478-4041-701a-a0ab-792da6f1404f",
  "fetchedAt": "2025-11-09T02:19:49.639Z",
  "emailCount": 24,
  "emails": [
    {
      "id": "19a595edc1f505e6",
      "threadId": "19a595edc1f505e6",
      "subject": "We've received your payment",
      "from": "Discover Card <discover@services.discover.com>",
      "to": "user@gmail.com",
      "date": "Thu, 6 Nov 2025 13:33:00 +0000",
      "snippet": "Your payment of $70.00 posted...",
      "labelIds": ["UNREAD", "INBOX"]
    }
  ]
}
```

---

## Running the Application

### Development Mode

1. **Start the Next.js development server**:
```bash
npm run dev
```

2. **Open browser** to `http://localhost:3000`

3. **Sign in** with your Cognito credentials

4. **Connect Gmail**:
   - Click the blue "Connect Gmail" button
   - Authorize Gmail access in the Google OAuth screen
   - You'll be redirected back with a "Gmail Connected" badge

5. **Fetch expenses**:
   - Click the green "Fetch Expenses" button
   - Wait for the loading spinner
   - See success message: "Successfully ingested X emails! Data saved to S3."

### Production Deployment

Frontend will be deployed to:
- **S3 + CloudFront** (static hosting)
- **Vercel** (alternative option)

Lambda is already deployed to AWS.

---

## Project Structure

```
exp-mgmt/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   ├── google/
│   │   │   │   └── route.ts      # OAuth initiation
│   │   │   └── callback/
│   │   │       └── route.ts      # OAuth callback handler
│   │   └── ingest-gmail/
│   │       └── route.ts          # Lambda invocation
│   ├── amplify-provider.tsx      # Cognito auth wrapper
│   ├── aws-exports.ts            # AWS Amplify config
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main dashboard
│   └── globals.css               # Global styles
│
├── lambda/                       # AWS Lambda Functions
│   └── gmail-ingest/
│       ├── index.ts              # Lambda handler (Gmail API)
│       ├── package.json          # Lambda dependencies
│       ├── tsconfig.json         # TypeScript config
│       └── node_modules/         # Dependencies (googleapis, AWS SDK)
│
├── public/                       # Static assets
├── .env.local                    # Environment variables (not in git)
├── .gitignore                    # Git ignore rules
├── package.json                  # Frontend dependencies
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Project overview
└── PROJECT_GOALS.md              # Development roadmap
```

---

## Key Components

### Frontend (`app/page.tsx`)

**Main Dashboard Component**

- **State Management**:
  - `gmailConnected`: Boolean - Gmail OAuth status
  - `accessToken`: String - OAuth access token
  - `refreshToken`: String - OAuth refresh token
  - `loading`: Boolean - API call in progress (shows spinner)
  - `message`: String - Success messages
  - `error`: String - Error messages

- **Key Functions**:
  - `handleConnectGmail()`: Redirects to OAuth flow
  - `handleGetExpenses()`: Calls API to invoke Lambda

- **UI Elements**:
  - Blue "Connect Gmail" button (shown when not connected)
  - Green "Gmail Connected" badge with checkmark (shown when connected)
  - Green "Fetch Expenses" button with download icon (only shown when connected)
  - Loading spinner during fetch operation
  - Success/error message boxes

### API Routes

#### `/api/auth/google/route.ts`
- Generates Google OAuth URL
- Redirects user to Google consent screen
- Scopes: Gmail readonly

#### `/api/auth/callback/route.ts`
- Receives authorization code from Google
- Exchanges code for access + refresh tokens
- Redirects to dashboard with tokens in URL params

#### `/api/ingest-gmail/route.ts`
- Accepts POST request with userId and tokens
- Invokes Lambda function using AWS SDK
- Returns email count and S3 location

### Lambda Function (`lambda/gmail-ingest/index.ts`)

**Gmail Ingestion Handler**

```typescript
export const handler = async (event: {
  userId: string;
  accessToken: string;
  refreshToken?: string;
}) => {
  // 1. Create OAuth2 client with Google credentials
  // 2. Set access + refresh tokens
  // 3. Initialize Gmail API
  // 4. Build query for transaction emails
  // 5. Fetch messages (up to 50)
  // 6. Extract email metadata
  // 7. Save to S3 as JSON
  // 8. Return success response
}
```

**Gmail Query Filter**:
```
after:{30_days_ago} (
  from:*amazon* OR from:*uber* OR from:*starbucks* OR
  from:*receipt* OR from:*order* OR
  subject:receipt OR subject:order OR
  subject:invoice OR subject:payment
)
```

---

## Environment Variables

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_AWS_USER_POOL_ID` | Cognito User Pool ID | `us-east-1_XXXXXXXXX` |
| `NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID` | Cognito App Client ID | `xxxxxxxxxxxxxxxxxxxxx` |
| `NEXT_PUBLIC_AWS_USER_DOMAIN` | Cognito Domain | `your-domain.auth.us-east-1.amazoncognito.com` |
| `AWS_REGION` | AWS Region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | IAM Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `GMAIL_INGEST_LAMBDA_NAME` | Lambda Function Name | `gmail-ingest-lambda` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID | `123456789-xxxxxxxxxxxxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` |
| `GOOGLE_REDIRECT_URI` | OAuth Redirect URI | `http://localhost:3000/api/auth/callback` |

### Lambda (AWS Console)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth Client ID | Same as frontend |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | Same as frontend |
| `GOOGLE_REDIRECT_URI` | OAuth Redirect URI | Same as frontend |
| `S3_BUCKET_NAME` | S3 Bucket for emails | `gmail-expense-emails-ma` |

---

## Troubleshooting

### Common Issues

#### 1. "Lambda not being invoked"
**Symptoms**: No new S3 files, no CloudWatch logs, "Fetch Expenses" button doesn't do anything

**Solutions**:
- Check browser Console tab for JavaScript errors
- Verify "Gmail Connected" badge is showing (must connect first)
- Check AWS credentials in `.env.local`
- Verify Lambda function name matches environment variable
- Check browser Network tab for API call failures
- Verify IAM role has Lambda invoke permissions

#### 2. "OAuth error: invalid_grant"
**Symptoms**: Gmail connection fails after callback

**Solutions**:
- Regenerate OAuth credentials in Google Cloud Console
- Verify redirect URI matches exactly (http vs https)
- Check tokens aren't expired
- Clear browser cookies and try again

#### 3. "Gmail API quota exceeded"
**Symptoms**: Error after multiple fetches

**Solutions**:
- Wait for quota reset (24 hours)
- Implement rate limiting in Lambda
- Use exponential backoff
- Request quota increase from Google

#### 4. "Lambda timeout"
**Symptoms**: 60-second timeout error

**Solutions**:
- Increase timeout in Lambda configuration
- Reduce number of emails fetched (currently 50)
- Optimize Gmail API calls
- Add pagination for large inboxes

#### 5. "S3 Access Denied"
**Symptoms**: Lambda can't write to S3

**Solutions**:
- Verify Lambda execution role has S3 write permissions
- Check bucket policy
- Ensure bucket name is correct in environment variables
- Verify region matches

### Debugging Tips

#### Check Lambda Logs
```bash
aws logs tail /aws/lambda/gmail-ingest-lambda --follow
```

#### Check S3 Contents
```bash
aws s3 ls s3://gmail-expense-emails-ma/gmail-inbox/ --recursive
```

#### Test Lambda Directly
```bash
aws lambda invoke \
  --function-name gmail-ingest-lambda \
  --payload '{"userId":"test","accessToken":"token"}' \
  response.json
```

#### Browser DevTools
- Open DevTools (F12)
- **Console tab**: Check for JavaScript errors or debug logs
- **Network tab**: Verify API calls to `/api/ingest-gmail`
  - Look for POST request with status 200
  - Check request payload includes `accessToken` and `refreshToken`
  - Check response shows email count and S3 location

#### View CloudWatch Metrics
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=gmail-ingest-lambda \
  --start-time 2025-11-08T00:00:00Z \
  --end-time 2025-11-09T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

---

## Next Steps

Once the current setup is working:

1. **Phase 5**: Build expense classification Lambda (Python + OpenAI)
2. **Phase 6**: Create DynamoDB tables for structured data
3. **Phase 7**: Enhance frontend with charts and analytics
4. **Phase 8**: Migrate infrastructure to Terraform
5. **Phase 9**: Implement CI/CD with GitHub Actions
6. **Phase 10**: Add cost monitoring and optimization

---

## Useful Commands

### Development
```bash
# Start dev server
npm run dev

# Build frontend
npm run build

# Start production server
npm start
```

### Lambda Deployment
```bash
# Build Lambda
cd lambda/gmail-ingest && npm run build

# Create deployment package
cd dist && zip ../function.zip index.js
cd .. && cd node_modules && zip -r ../function.zip .

# Deploy to AWS
aws lambda update-function-code \
  --function-name gmail-ingest-lambda \
  --zip-file fileb://function.zip
```

### AWS CLI
```bash
# List Lambda functions
aws lambda list-functions --no-cli-pager

# Get Lambda config
aws lambda get-function-configuration \
  --function-name gmail-ingest-lambda --no-cli-pager

# List S3 buckets
aws s3 ls

# View S3 bucket contents
aws s3 ls s3://gmail-expense-emails-ma/gmail-inbox/ --recursive
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## Security Best Practices

### Environment Variables
- ✅ **All secrets stored in `.env.local`** (never committed to Git)
- ✅ **`.env.local` excluded in `.gitignore`**
- ✅ **`.env.example` provided** as a template with placeholder values
- ✅ **No hardcoded credentials** in source code or documentation
- ✅ **AWS credentials use IAM roles** with least-privilege access

### Production Recommendations
1. **Use AWS Secrets Manager** for storing sensitive credentials
2. **Rotate credentials regularly** (AWS keys, OAuth secrets)
3. **Enable MFA** on AWS root and IAM accounts
4. **Use environment-specific credentials** (dev, staging, prod)
5. **Monitor CloudWatch logs** for suspicious activity
6. **Implement rate limiting** on API routes
7. **Enable AWS CloudTrail** for audit logging

### What's Protected
- AWS Access Keys and Secret Keys
- Google OAuth Client ID and Secret
- Cognito User Pool IDs
- Gmail OAuth tokens (access & refresh)
- User email addresses and personal data

---

## Known Limitations & Future Improvements

### Current Limitations
1. **No Email Deduplication**: Clicking "Fetch Expenses" multiple times creates duplicate files in S3
2. **No Incremental Fetching**: Always fetches the same 30-day window, not just new emails
3. **Fixed Time Window**: Hardcoded to last 30 days (not configurable)
4. **No Historical Tracking**: Doesn't remember what was previously fetched

### Planned Improvements (Phase 5+)
1. **Email Deduplication**: 
   - Store emails using Gmail message ID as unique key
   - Check S3 before saving to avoid duplicates
   
2. **Incremental Fetching**:
   - Track last fetch timestamp in DynamoDB
   - Only fetch emails received after last fetch
   
3. **Better Storage Strategy**:
   - Individual files per email: `s3://bucket/emails/{userId}/{messageId}.json`
   - Prevents duplicates automatically (same ID = same file path)
   
4. **User Preferences**:
   - Configurable time windows
   - Custom email filters
   - Scheduled automatic fetching

---

**Last Updated**: November 9, 2025  
**Version**: 1.1.0  
**Maintainer**: Moiz Amjad
