output "gaming_instance_role_arn" {
  description = "ARN of gaming instance IAM role"
  value       = aws_iam_role.gaming_instance.arn
}

output "gaming_instance_role_name" {
  description = "Name of gaming instance IAM role"
  value       = aws_iam_role.gaming_instance.name
}

output "gaming_instance_profile_name" {
  description = "Name of gaming instance IAM instance profile"
  value       = aws_iam_instance_profile.gaming_instance.name
}

output "gaming_instance_profile_arn" {
  description = "ARN of gaming instance IAM instance profile"
  value       = aws_iam_instance_profile.gaming_instance.arn
}
