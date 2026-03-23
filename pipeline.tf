# ============================================================
# Anvil Bidding Pipeline Infrastructure
# ============================================================

# --- Cloud SQL (PostgreSQL) ---
resource "google_sql_database_instance" "pipeline_db" {
  name             = "anvil-pipeline-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled = true
      # TODO: lock down with authorized networks or private IP
    }

    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "anvil_db" {
  name     = "anvil_bidding"
  instance = google_sql_database_instance.pipeline_db.name
}

resource "google_sql_user" "app_user" {
  name     = "anvil_app"
  instance = google_sql_database_instance.pipeline_db.name
  password = var.db_password
}

# --- GCS: Raw RFP Document Storage ---
resource "google_storage_bucket" "raw_rfp_docs" {
  name     = "${var.project_id}-raw-rfp-docs"
  location = var.region

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
  }
}

# --- Pub/Sub: Pipeline Stage Topics ---

# Stage 1: New raw documents scraped
resource "google_pubsub_topic" "raw_scraped" {
  name = "rfp-raw-scraped"
}

resource "google_pubsub_subscription" "raw_scraped_sub" {
  name  = "rfp-raw-scraped-sub"
  topic = google_pubsub_topic.raw_scraped.id

  ack_deadline_seconds = 60
}

# Stage 2: Deduplication complete
resource "google_pubsub_topic" "dedup_complete" {
  name = "rfp-dedup-complete"
}

resource "google_pubsub_subscription" "dedup_complete_sub" {
  name  = "rfp-dedup-complete-sub"
  topic = google_pubsub_topic.dedup_complete.id

  ack_deadline_seconds = 60
}

# Stage 3: Parsing complete — products extracted
resource "google_pubsub_topic" "parsing_complete" {
  name = "rfp-parsing-complete"
}

resource "google_pubsub_subscription" "parsing_complete_sub" {
  name  = "rfp-parsing-complete-sub"
  topic = google_pubsub_topic.parsing_complete.id

  ack_deadline_seconds = 60
}

# Stage 4: Sourcing complete — merchant matches found
resource "google_pubsub_topic" "sourcing_complete" {
  name = "rfp-sourcing-complete"
}

resource "google_pubsub_subscription" "sourcing_complete_sub" {
  name  = "rfp-sourcing-complete-sub"
  topic = google_pubsub_topic.sourcing_complete.id

  ack_deadline_seconds = 60
}

# Stage 5: Ranking complete — bids scored
resource "google_pubsub_topic" "ranking_complete" {
  name = "rfp-ranking-complete"
}

resource "google_pubsub_subscription" "ranking_complete_sub" {
  name  = "rfp-ranking-complete-sub"
  topic = google_pubsub_topic.ranking_complete.id

  ack_deadline_seconds = 60
}

# Stage 6: Bid submitted
resource "google_pubsub_topic" "bid_submitted" {
  name = "rfp-bid-submitted"
}

resource "google_pubsub_subscription" "bid_submitted_sub" {
  name  = "rfp-bid-submitted-sub"
  topic = google_pubsub_topic.bid_submitted.id

  ack_deadline_seconds = 60
}
