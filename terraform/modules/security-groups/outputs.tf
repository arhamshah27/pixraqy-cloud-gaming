output "gaming_instance_sg_id" {
  description = "Security group ID for gaming instances"
  value       = aws_security_group.gaming_instance.id
}

output "control_plane_sg_id" {
  description = "Security group ID for control plane"
  value       = aws_security_group.control_plane.id
}

output "turn_server_sg_id" {
  description = "Security group ID for TURN server"
  value       = aws_security_group.turn_server.id
}
