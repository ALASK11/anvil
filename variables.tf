variable "image_url" {
  type        = string
  description = "The URL of the Docker image in Artifact Registry"
}

variable "db_password" {
  description = "Cloud SQL application user password"
  type        = string
  sensitive   = true
}