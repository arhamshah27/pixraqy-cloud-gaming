# Security Groups for Pixray Cloud Gaming Platform

# Gaming Instance Security Group
resource "aws_security_group" "gaming_instance" {
  name        = "${var.project_name}-${var.environment}-gaming-instance-sg"
  description = "Security group for gaming instances running Sunshine"
  vpc_id      = var.vpc_id

  # GameStream / Sunshine TCP port
  ingress {
    description = "Sunshine GameStream TCP"
    from_port   = 47984
    to_port     = 47984
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # GameStream / Sunshine UDP ports for video/audio streaming
  ingress {
    description = "Sunshine GameStream UDP"
    from_port   = 47998
    to_port     = 48010
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Sunshine HTTPS Web UI (optional, for pairing)
  ingress {
    description = "Sunshine HTTPS Web UI"
    from_port   = 47990
    to_port     = 47990
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # RDP access (restricted to admin IPs)
  dynamic "ingress" {
    for_each = length(var.allow_rdp_from_cidr) > 0 ? [1] : []
    content {
      description = "RDP for administration"
      from_port   = 3389
      to_port     = 3389
      protocol    = "tcp"
      cidr_blocks = var.allow_rdp_from_cidr
    }
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-gaming-instance-sg"
  }
}

# Control Plane Security Group (for admin access)
resource "aws_security_group" "control_plane" {
  name        = "${var.project_name}-${var.environment}-control-plane-sg"
  description = "Security group for control plane admin access"
  vpc_id      = var.vpc_id

  # SSH access (restricted to admin IPs)
  ingress {
    description = "SSH for administration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.admin_ip_whitelist
  }

  # HTTPS
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP (redirect to HTTPS)
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-control-plane-sg"
  }
}

# TURN/STUN Server Security Group (optional)
resource "aws_security_group" "turn_server" {
  name        = "${var.project_name}-${var.environment}-turn-server-sg"
  description = "Security group for TURN/STUN server (NAT traversal)"
  vpc_id      = var.vpc_id

  # STUN/TURN TCP
  ingress {
    description = "STUN/TURN TCP"
    from_port   = 3478
    to_port     = 3478
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # STUN/TURN UDP
  ingress {
    description = "STUN/TURN UDP"
    from_port   = 3478
    to_port     = 3478
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # TURN UDP relay ports
  ingress {
    description = "TURN UDP relay"
    from_port   = 49152
    to_port     = 65535
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # TLS/DTLS
  ingress {
    description = "STUN/TURN TLS"
    from_port   = 5349
    to_port     = 5349
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-turn-server-sg"
  }
}
