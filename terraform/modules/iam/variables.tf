variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_log_bucket_arn" {
  description = "ARN of S3 log bucket"
  type        = string
}
