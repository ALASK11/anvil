---
name: Direct IAP for Cloud Run
description: Project uses Direct IAP (GA March 2026) in front of Cloud Run — no load balancer needed. IAP sits directly on Cloud Run.
type: project
---

Direct IAP for Cloud Run went GA in early March 2026. This project uses it — IAP sits directly in front of Cloud Run without needing a load balancer. Users need both `roles/run.invoker` and `roles/iap.httpsResourceAccessor` to access the service.

**Why:** Simplifies architecture — no LB, NEG, or backend service needed. IAP handles Google login screen directly on the Cloud Run URL.

**How to apply:** When granting user access, both IAM bindings are needed. When discussing architecture, do not suggest adding a load balancer — Direct IAP handles it.
