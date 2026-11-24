output "log_bucket_name" {
  description = "Name of S3 log bucket"
  value       = aws_s3_bucket.logs.id
}

output "log_bucket_arn" {
  description = "ARN of S3 log bucket"
  value       = aws_s3_bucket.logs.arn
}

output "snapshot_bucket_name" {
  description = "Name of S3 snapshot bucket"
  value       = aws_s3_bucket.snapshots.id
}

output "snapshot_bucket_arn" {
  description = "ARN of S3 snapshot bucket"
  value       = aws_s3_bucket.snapshots.arn
}
