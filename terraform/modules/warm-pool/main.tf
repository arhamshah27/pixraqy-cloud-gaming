# Warm Pool Auto Scaling Group for Pixray Cloud Gaming Platform
# Maintains a pool of pre-warmed gaming instances for faster session starts

# Launch Template
resource "aws_launch_template" "warm_pool" {
  name_prefix   = "${var.project_name}-${var.environment}-warm-pool-"
  image_id      = var.windows_ami_id
  instance_type = var.instance_type

  iam_instance_profile {
    name = var.iam_instance_profile_name
  }

  vpc_security_group_ids = [var.gaming_instance_sg_id]

  monitoring {
    enabled = true
  }

  metadata_options {
    http_tokens = "required"
    http_put_response_hop_limit = 1
  }

  user_data = base64encode(templatefile("${path.module}/user-data.ps1", {
    session_id = "warm-pool"
  }))

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name        = "${var.project_name}-${var.environment}-warm-pool-instance"
      Type        = "warm-pool"
      ManagedBy   = "AutoScaling"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "warm_pool" {
  name                = "${var.project_name}-${var.environment}-warm-pool-asg"
  vpc_zone_identifier = var.private_subnet_ids
  desired_capacity    = var.warm_pool_size
  max_size            = var.warm_pool_size + 2
  min_size            = 0

  launch_template {
    id      = aws_launch_template.warm_pool.id
    version = "$Latest"
  }

  health_check_type         = "EC2"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "${var.project_name}-${var.environment}-warm-pool-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Type"
    value               = "warm-pool"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Scaling Policies
resource "aws_autoscaling_policy" "scale_up" {
  name                   = "${var.project_name}-${var.environment}-warm-pool-scale-up"
  scaling_adjustment     = 1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.warm_pool.name
}

resource "aws_autoscaling_policy" "scale_down" {
  name                   = "${var.project_name}-${var.environment}-warm-pool-scale-down"
  scaling_adjustment     = -1
  adjustment_type        = "ChangeInCapacity"
  cooldown               = 300
  autoscaling_group_name = aws_autoscaling_group.warm_pool.name
}
