terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment for remote state storage
  # backend "s3" {
  #   bucket         = "pixray-terraform-state"
  #   key            = "gaming-platform/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Application = "Pixray-Cloud-Gaming"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
  azs          = var.availability_zones
}

# Security Groups Module
module "security_groups" {
  source = "./modules/security-groups"

  project_name         = var.project_name
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  admin_ip_whitelist   = var.admin_ip_whitelist
  allow_rdp_from_cidr  = var.allow_rdp_from_cidr
}

# IAM Module
module "iam" {
  source = "./modules/iam"

  project_name = var.project_name
  environment  = var.environment
  s3_log_bucket_arn = module.s3.log_bucket_arn
}

# S3 Module
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# Secrets Manager Module
module "secrets" {
  source = "./modules/secrets-manager"

  project_name = var.project_name
  environment  = var.environment
}

# Optional: Warm Pool Auto Scaling Group
module "warm_pool" {
  source = "./modules/warm-pool"
  count  = var.enable_warm_pool ? 1 : 0

  project_name             = var.project_name
  environment              = var.environment
  vpc_id                   = module.vpc.vpc_id
  private_subnet_ids       = module.vpc.private_subnet_ids
  gaming_instance_sg_id    = module.security_groups.gaming_instance_sg_id
  iam_instance_profile_name = module.iam.gaming_instance_profile_name
  windows_ami_id           = var.windows_ami_id
  instance_type            = var.instance_type
  warm_pool_size           = var.warm_pool_size
}
