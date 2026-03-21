variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "project_number" {
  description = "GCP Project Number"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Run Service (Next.js)
resource "google_cloud_run_v2_service" "nextjs_app" {
  name     = "private-nextjs-site"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL" # Must be public for IAP to proxy to it

  template {
    containers {
      image = "us-central1-docker.pkg.dev/anvil-private/nextjs-repo/nextjs-app"
      ports {
        container_port = 3000
      }
    }
  }
}

# Allow IAP service account to invoke Cloud Run
resource "google_cloud_run_v2_service_iam_member" "iap_invoker" {
  name     = google_cloud_run_v2_service.nextjs_app.name
  location = google_cloud_run_v2_service.nextjs_app.location
  role     = "roles/run.invoker"
  member   = "serviceAccount:service-${var.project_number}@gcp-sa-iap.iam.gserviceaccount.com"
}
