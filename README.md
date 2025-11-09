# Expense Management System - Project Goals & Progress

## 🎯 Project Overview
An AI-powered expense tracking system that automatically categorizes transactions from Gmail using AWS serverless architecture, deployed with Infrastructure as Code (Terraform), showcasing cloud automation and cost optimization skills.

## 🎓 Core Objectives
- Demonstrate **AWS Solutions Architect** proficiency
- Showcase **Infrastructure as Code (IaC)** expertise with Terraform
- Build secure, scalable serverless applications
- Implement cost optimization and monitoring best practices
- Create production-ready cloud applications

---

## 📊 Current Progress Status

### ✅ COMPLETED PHASES

#### **PHASE 2 — AWS Serverless Backend** ✅ COMPLETE
- [x] AWS IAM roles configured for Lambda and S3
- [x] **gmail_ingest_lambda** deployed (Node.js 18.x)
  - Fetches real Gmail emails via Google OAuth 2.0
  - Filters transaction emails (receipts, invoices, orders, payments)
  - Stores email data in S3 as JSON
  - Successfully tested with 24 real emails
- [x] **S3 Bucket**: `gmail-expense-emails-ma`
  - Raw email storage with organized structure
  - Currently storing real Gmail transaction data
- [x] **API Gateway**: Next.js API routes (`/api/ingest-gmail`)
  - POST endpoint to trigger Lambda
  - Secured with AWS credentials
- [x] CloudWatch logging enabled for monitoring

#### **PHASE 3 — Authentication & Security** ✅ COMPLETE
- [x] **Amazon Cognito** integrated
  - User pool configured
  - Hosted UI configured
  - JWT-based authentication working
- [x] **Google OAuth 2.0** integration
  - Client ID and secrets configured
  - Gmail API access granted
  - OAuth callback flow working
  - Access and refresh tokens managed securely
- [x] Frontend authentication with Amplify
  - Login/logout functionality
  - Protected routes
  - User session management
- [x] Environment variables secured in `.env.local`
- [x] HTTPS enforced for all communications

---

## 🚀 UPCOMING PHASES

### 🧠 PHASE 4 — Email Parsing & Classification (CURRENT)
**Goal**: Extract structured expense data from emails using LLM classification.

**Planned Tasks**:
- [ ] Create `classify_lambda` (Python)
  - Parse email content to extract amounts, merchants, dates
  - Call OpenAI API or AWS Bedrock for transaction classification
  - Identify categories (Food, Transportation, Entertainment, etc.)
  - Store structured data in DynamoDB
- [ ] Create DynamoDB tables:
  - `Transactions` - Classified expense data
  - `Categories` - Expense categories
- [ ] Integrate classification with existing Gmail ingestion
- [ ] Test with real email samples
- [ ] Create `/api/classify` endpoint

### 📊 PHASE 5 — Frontend Dashboard Enhancement
**Goal**: Display parsed expenses with analytics and insights.

**Planned Tasks**:
- [ ] Build expense table view
  - Show merchant, amount, date, category
  - Sortable and filterable columns
- [ ] Add expense charts/visualizations
  - Monthly spending trends
  - Category breakdown (pie chart)
  - Year-over-year comparison
- [ ] Implement summary statistics
  - Total expenses this month
  - Top spending categories
  - Average transaction amount
- [ ] Add filtering capabilities
  - Date range picker
  - Category filter
  - Merchant search

### 🧰 PHASE 6 — Infrastructure as Code (Terraform)
**Goal**: Replace manual AWS setup with Terraform to showcase IaC automation skills.

**Planned Tasks**:
- [ ] Initialize Terraform project structure
- [ ] Create Terraform modules:
  - S3 buckets (raw emails + frontend)
  - Lambda functions + IAM roles
  - DynamoDB tables
  - API Gateway
  - Cognito user pool
  - CloudWatch alarms
- [ ] Configure remote state (S3 backend)
- [ ] Document infrastructure with diagrams
- [ ] Test `terraform plan` and `terraform apply`
- [ ] Version control Terraform configs

### ⚙️ PHASE 7 — Cost Optimization & Monitoring
**Goal**: Implement cloud cost management and monitoring best practices.

**Planned Tasks**:
- [ ] Create cost monitoring Lambda
  - Identify idle resources
  - Track Lambda invocation costs
  - Alert on anomalies
- [ ] Enable AWS Budgets ($1/month threshold)
- [ ] Implement resource tagging strategy:
  ```
  project = "expense-tracker"
  environment = "dev"
  owner = "moiz"
  ```
- [ ] Set up CloudWatch dashboards
- [ ] Configure SNS alerts for errors and cost overruns
- [ ] Document cost optimization strategies

### 🔄 PHASE 8 — CI/CD Pipeline
**Goal**: Automate deployment with GitHub Actions.

**Planned Tasks**:
- [ ] Create GitHub Actions workflows:
  - Run tests on pull requests
  - `terraform plan` on PR
  - Auto-deploy on merge to main
  - Lambda deployment automation
- [ ] Set up staging environment
- [ ] Implement blue-green deployments
- [ ] Add deployment notifications (Slack/email)

### 🧩 PHASE 9 — Documentation & Portfolio
**Goal**: Professional presentation for job applications.

**Planned Tasks**:
- [ ] Create architecture diagram
- [ ] Write comprehensive technical README
- [ ] Add demo video/screenshots
- [ ] Deploy public demo site
- [ ] Write LinkedIn/blog post
- [ ] Prepare interview talking points

---

## 🎁 Bonus / Stretch Goals

### Advanced AWS Features
- [ ] **Amazon Bedrock** - Replace OpenAI with AWS-native LLM
- [ ] **EventBridge** - Schedule automatic Gmail ingestion
- [ ] **AWS X-Ray** - Distributed tracing for debugging
- [ ] **QuickSight** - Advanced expense analytics and reporting
- [ ] **Step Functions** - Orchestrate multi-step workflows
- [ ] **SQS** - Queue email processing for scalability

### Enhanced Features
- [ ] Multi-user support with user-specific data
- [ ] Email attachment processing (PDF receipts)
- [ ] Duplicate transaction detection
- [ ] Expense approval workflows
- [ ] Export to CSV/Excel
- [ ] Mobile app (React Native)
- [ ] Receipt image OCR processing
- [ ] Recurring expense detection

### DevOps Enhancements
- [ ] Terraform Cloud integration
- [ ] Multi-region deployment
- [ ] Automated backup and disaster recovery
- [ ] Performance testing and optimization
- [ ] Security scanning (AWS Inspector)

---

## 🏗️ Technical Stack

### Frontend
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI components
- **AWS Amplify** - Authentication SDK
- **Tailwind CSS** - Styling

### Backend
- **AWS Lambda** - Serverless compute
  - Node.js 18.x (Gmail ingestion)
  - Python (planned for classification)
- **API Gateway** - Next.js API routes
- **Amazon Cognito** - User authentication
- **S3** - Email storage
- **DynamoDB** - Transaction database (planned)

### Security & Auth
- **Google OAuth 2.0** - Gmail API access
- **Amazon Cognito** - User management
- **AWS IAM** - Role-based access control

### Infrastructure
- **Terraform** - IaC automation (planned)
- **GitHub Actions** - CI/CD (planned)
- **CloudWatch** - Monitoring and logging

### AI/ML
- **Gmail API** - Email fetching
- **OpenAI API** or **AWS Bedrock** - Expense classification (planned)

---

## 📈 Success Metrics

### Technical Achievements
- ✅ Real Gmail integration (24 emails fetched successfully)
- ✅ Serverless architecture deployed
- ✅ OAuth authentication working end-to-end
- ⏳ IaC deployment with Terraform
- ⏳ Cost under $1/month
- ⏳ <200ms API response time
- ⏳ 99.9% uptime

### Portfolio Impact
- Demonstrates AWS expertise for MEDITECH interviews
- Showcases full-stack development skills
- Proves automation and IaC proficiency
- Highlights security best practices
- Shows cost optimization mindset

---

## 🎯 Next Immediate Steps

1. **Phase 5 - Email Classification**
   - Set up DynamoDB table for transactions
   - Create Python Lambda for parsing emails
   - Integrate OpenAI API for classification
   - Test with real Gmail data

2. **Frontend Enhancement**
   - Display fetched emails in dashboard
   - Show expense statistics
   - Add basic filtering

3. **Terraform Migration**
   - Document current AWS resources
   - Create initial Terraform configs
   - Test infrastructure deployment

---

## 📝 Notes & Learnings

### What's Working Well
- Gmail OAuth flow is robust and user-friendly
- Two-button UI clearly separates connection and fetching actions
- Lambda function successfully processes real emails
- S3 storage structure is clean and scalable
- Next.js API routes provide good abstraction
- Loading states with spinners improve UX

### Challenges Overcome
- Lambda deployment package structure (index.js at root)
- Handler path configuration (`index.handler` vs `dist/index.handler`)
- Gmail API query optimization for transaction emails
- OAuth token management between frontend and Lambda

### Future Considerations
- Token refresh strategy for long-lived sessions
- Rate limiting for Gmail API calls
- Error handling for malformed emails
- Data retention policies for S3
- Multi-region deployment for redundancy
- Email deduplication to prevent duplicate storage
- Incremental fetching (only new emails since last fetch)
- Track last fetch timestamp in DynamoDB

---

**Last Updated**: November 9, 2025  
**Current Phase**: Transitioning from Phase 4 to Phase 5 (Email Parsing & Classification)
