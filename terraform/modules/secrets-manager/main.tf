# AWS Secrets Manager for Pixray Cloud Gaming Platform

# Create secret for production environment
resource "aws_secretsmanager_secret" "pixray" {
  name        = "pixray/${var.environment}"
  description = "Secrets for Pixray Cloud Gaming Platform - ${var.environment}"

  recovery_window_in_days = 30

  tags = {
    Name        = "pixray/${var.environment}"
    Environment = var.environment
  }
}

# Placeholder secret version (update manually or via CI/CD)
resource "aws_secretsmanager_secret_version" "pixray" {
  secret_id = aws_secretsmanager_secret.pixray.id

  secret_string = jsonencode({
    STRIPE_SECRET_KEY        = "sk_test_PLACEHOLDER_REPLACE_ME"
    STRIPE_WEBHOOK_SECRET    = "whsec_PLACEHOLDER_REPLACE_ME"
    STEAM_API_KEY            = "PLACEHOLDER_REPLACE_ME"
    WINDOWS_AMI_ID           = "ami-PLACEHOLDER"
    WINDOWS_AMI_ID_2025      = "ami-PLACEHOLDER"
    HOST_AGENT_SECRET        = "PLACEHOLDER_REPLACE_ME"
    SUPABASE_SERVICE_ROLE_KEY = "PLACEHOLDER_REPLACE_ME"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
