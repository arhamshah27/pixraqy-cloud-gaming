# IAM Roles and Policies for Pixray Cloud Gaming Platform

# Gaming Instance IAM Role
resource "aws_iam_role" "gaming_instance" {
  name = "${var.project_name}-${var.environment}-gaming-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "${var.project_name}-${var.environment}-gaming-instance-role"
  }
}

# Gaming Instance Policy
resource "aws_iam_role_policy" "gaming_instance" {
  name = "${var.project_name}-${var.environment}-gaming-instance-policy"
  role = aws_iam_role.gaming_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl"
        ]
        Resource = [
          "${var.s3_log_bucket_arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
        Condition = {
          StringEquals = {
            "cloudwatch:namespace" = "Pixray/Gaming"
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/pixray/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:pixray/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeInstances",
          "ec2:DescribeTags"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach AWS managed policies for SSM (Systems Manager)
resource "aws_iam_role_policy_attachment" "gaming_instance_ssm" {
  role       = aws_iam_role.gaming_instance.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "gaming_instance" {
  name = "${var.project_name}-${var.environment}-gaming-instance-profile"
  role = aws_iam_role.gaming_instance.name

  tags = {
    Name = "${var.project_name}-${var.environment}-gaming-instance-profile"
  }
}
