variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "pixray-cloud"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "admin_ip_whitelist" {
  description = "List of IP addresses allowed for admin access (RDP, SSH)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Change in production!
}

variable "allow_rdp_from_cidr" {
  description = "CIDR block allowed for RDP access"
  type        = list(string)
  default     = []
}

variable "windows_ami_id" {
  description = "Windows Server AMI ID (can be base or pre-baked with Sunshine)"
  type        = string
  default     = "" # Will use latest Windows Server 2022 if empty
}

variable "instance_type" {
  description = "EC2 instance type for gaming instances"
  type        = string
  default     = "g4dn.xlarge" # NVIDIA T4 GPU
}

variable "enable_warm_pool" {
  description = "Enable warm pool of pre-warmed instances"
  type        = bool
  default     = false
}

variable "warm_pool_size" {
  description = "Number of instances in warm pool"
  type        = number
  default     = 2
}
