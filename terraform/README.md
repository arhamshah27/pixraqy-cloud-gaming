# Pixray Cloud Gaming - Terraform Infrastructure

This directory contains Terraform modules for deploying the Pixray Cloud Gaming infrastructure on AWS.

## Modules

- `vpc` - VPC, subnets, NAT gateways, and routing
- `security-groups` - Security groups for gaming instances and control plane
- `iam` - IAM roles and policies for EC2 instances
- `s3` - S3 buckets for logs and snapshots
- `secrets-manager` - AWS Secrets Manager configuration
- `gaming-instance` - EC2 instance configuration for gaming hosts

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.5.0
3. An AWS account with appropriate permissions

## Quick Start

### 1. Initialize Terraform

```bash
cd terraform
terraform init
```

### 2. Configure Variables

Copy the example variables file and customize it:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your specific values.

### 3. Plan Deployment

Review the planned changes:

```bash
terraform plan
```

### 4. Deploy Infrastructure

```bash
terraform apply
```

## Configuration

### Required Variables

- `aws_region` - AWS region (default: us-east-1)
- `environment` - Environment name (dev, staging, production)
- `project_name` - Project name (default: pixray-cloud)

### Optional Variables

- `enable_warm_pool` - Enable warm pool of pre-warmed instances (default: false)
- `warm_pool_size` - Number of instances in warm pool (default: 2)
- `windows_ami_id` - Custom Windows AMI ID with Sunshine pre-installed

## Security Considerations

1. **Secrets Management**: All sensitive values (Stripe keys, API keys) should be stored in AWS Secrets Manager
2. **Network Isolation**: Gaming instances are deployed in private subnets with NAT gateway for outbound traffic
3. **Security Groups**: Strict ingress rules - only GameStream ports open, admin access restricted by IP
4. **IAM Roles**: Principle of least privilege for all instance roles

## Cost Optimization

- Use Spot Instances for gaming hosts to reduce costs by up to 70%
- Enable warm pool only in production
- Set up auto-scaling policies to terminate idle instances
- Use S3 lifecycle policies for log retention

## Outputs

After deployment, Terraform will output:

- VPC ID
- Public/Private Subnet IDs
- Security Group IDs
- IAM Role ARNs
- S3 Bucket Names

## Cleanup

To destroy all infrastructure:

```bash
terraform destroy
```

**WARNING**: This will terminate all running gaming sessions and delete all resources.
