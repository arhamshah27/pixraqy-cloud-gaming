# Pixray Cloud Gaming Platform - Sunshine/Moonlight Integration

A cloud gaming platform built with **Sunshine** (game streaming server) and **Moonlight** (client), running on-demand Windows gaming instances on AWS.

## Features

- **On-Demand Gaming Sessions**: Launch Windows Server instances with NVIDIA GPUs on demand
- **Sunshine GameStream**: Self-hosted NVIDIA GameStream alternative
- **Moonlight Client Support**: Connect from any device (Windows, Mac, Linux, iOS, Android)
- **Credit-Based Billing**: Pay-as-you-go with Stripe integration
- **Host Agent Monitoring**: Real-time GPU, CPU, and network metrics
- **Warm Pool Support**: Pre-warmed instances for faster session starts
- **Steam Ownership Verification**: Optional game ownership checks via Steam API
- **Terraform Infrastructure**: Production-ready AWS infrastructure as code
- **CloudWatch Observability**: Comprehensive metrics and logging

## Architecture

### Components

1. **Next.js Frontend**: React-based dashboard for game selection and session management
2. **API Routes**: Next.js API routes for session broker, payments, and host-agent communication
3. **Session Broker**: Orchestrates EC2 instance lifecycle and session allocation
4. **Host Agent**: Windows service running on gaming instances for health monitoring
5. **Sunshine**: GameStream server for low-latency game streaming
6. **Infrastructure**: Terraform modules for VPC, EC2, IAM, S3, and Secrets Manager

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout
- **Infrastructure**: AWS (EC2, VPC, IAM, S3, CloudWatch, Secrets Manager)
- **IaC**: Terraform
- **Game Streaming**: Sunshine + Moonlight

## Quick Start

### Prerequisites

- Node.js >= 18
- npm or yarn
- AWS account with configured credentials
- Supabase project
- Stripe account (test mode)
- Terraform >= 1.5.0 (for infrastructure deployment)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.sample .env
```

Edit `.env` with your configuration.

### 3. Set Up Database

Run the Supabase migration:

```bash
# Apply migration in Supabase dashboard or CLI
supabase/migrations/001_gaming_sessions_schema.sql
```

### 4. Deploy Infrastructure

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

### 5. Run Development Server

```bash
npm run dev
```

See full documentation in the main README.
