output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "gaming_instance_sg_id" {
  description = "Security group ID for gaming instances"
  value       = module.security_groups.gaming_instance_sg_id
}

output "gaming_instance_role_arn" {
  description = "IAM role ARN for gaming instances"
  value       = module.iam.gaming_instance_role_arn
}

output "gaming_instance_profile_name" {
  description = "IAM instance profile name for gaming instances"
  value       = module.iam.gaming_instance_profile_name
}

output "log_bucket_name" {
  description = "S3 bucket name for logs"
  value       = module.s3.log_bucket_name
}

output "snapshot_bucket_name" {
  description = "S3 bucket name for snapshots"
  value       = module.s3.snapshot_bucket_name
}

output "secrets_arn" {
  description = "ARN of Secrets Manager secret"
  value       = module.secrets.secret_arn
}

output "warm_pool_asg_name" {
  description = "Auto Scaling Group name for warm pool (if enabled)"
  value       = var.enable_warm_pool ? module.warm_pool[0].asg_name : null
}
