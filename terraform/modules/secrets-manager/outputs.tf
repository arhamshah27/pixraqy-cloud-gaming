output "secret_arn" {
  description = "ARN of Secrets Manager secret"
  value       = aws_secretsmanager_secret.pixray.arn
}

output "secret_name" {
  description = "Name of Secrets Manager secret"
  value       = aws_secretsmanager_secret.pixray.name
}
