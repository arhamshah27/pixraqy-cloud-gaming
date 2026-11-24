/**
 * AWS Configuration Module
 * Centralizes AWS SDK configuration and client initialization
 */

import {
  EC2Client,
  EC2ClientConfig,
} from "@aws-sdk/client-ec2";
import {
  SecretsManagerClient,
  SecretsManagerClientConfig,
} from "@aws-sdk/client-secrets-manager";
import {
  CloudWatchClient,
  CloudWatchClientConfig,
} from "@aws-sdk/client-cloudwatch";
import {
  CloudWatchLogsClient,
  CloudWatchLogsClientConfig,
} from "@aws-sdk/client-cloudwatch-logs";
import {
  S3Client,
  S3ClientConfig,
} from "@aws-sdk/client-s3";

// AWS Region from environment
const AWS_REGION = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "us-east-1";

// Credentials configuration
// In production, use IAM roles. For local dev, use environment variables or AWS profiles.
const getAWSCredentials = () => {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN && {
        sessionToken: process.env.AWS_SESSION_TOKEN,
      }),
    };
  }
  // If credentials are not provided, SDK will use default credential chain
  // (IAM roles, ~/.aws/credentials, etc.)
  return undefined;
};

const baseConfig = {
  region: AWS_REGION,
  credentials: getAWSCredentials(),
};

// EC2 Client
let ec2ClientInstance: EC2Client | null = null;
export function getEC2Client(): EC2Client {
  if (!ec2ClientInstance) {
    const config: EC2ClientConfig = { ...baseConfig };
    ec2ClientInstance = new EC2Client(config);
  }
  return ec2ClientInstance;
}

// Secrets Manager Client
let secretsManagerClientInstance: SecretsManagerClient | null = null;
export function getSecretsManagerClient(): SecretsManagerClient {
  if (!secretsManagerClientInstance) {
    const config: SecretsManagerClientConfig = { ...baseConfig };
    secretsManagerClientInstance = new SecretsManagerClient(config);
  }
  return secretsManagerClientInstance;
}

// CloudWatch Client
let cloudWatchClientInstance: CloudWatchClient | null = null;
export function getCloudWatchClient(): CloudWatchClient {
  if (!cloudWatchClientInstance) {
    const config: CloudWatchClientConfig = { ...baseConfig };
    cloudWatchClientInstance = new CloudWatchClient(config);
  }
  return cloudWatchClientInstance;
}

// CloudWatch Logs Client
let cloudWatchLogsClientInstance: CloudWatchLogsClient | null = null;
export function getCloudWatchLogsClient(): CloudWatchLogsClient {
  if (!cloudWatchLogsClientInstance) {
    const config: CloudWatchLogsClientConfig = { ...baseConfig };
    cloudWatchLogsClientInstance = new CloudWatchLogsClient(config);
  }
  return cloudWatchLogsClientInstance;
}

// S3 Client
let s3ClientInstance: S3Client | null = null;
export function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    const config: S3ClientConfig = { ...baseConfig };
    s3ClientInstance = new S3Client(config);
  }
  return s3ClientInstance;
}

export { AWS_REGION };
