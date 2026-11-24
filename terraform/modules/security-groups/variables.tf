variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "admin_ip_whitelist" {
  description = "List of IP addresses allowed for admin access"
  type        = list(string)
}

variable "allow_rdp_from_cidr" {
  description = "CIDR blocks allowed for RDP access"
  type        = list(string)
  default     = []
}
