-- Anvil Bidding Pipeline Schema
-- Run against the anvil_bidding database

-- ============================================================
-- Stage 0: Scrape Sources
-- ============================================================
CREATE TABLE scrape_sources (
    id              SERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    url             TEXT NOT NULL,
    source_type     TEXT NOT NULL,  -- 'wordpress', 'pdf_index', 'html', 'api', etc.
    is_active       BOOLEAN DEFAULT TRUE,
    scrape_interval TEXT DEFAULT '1h',
    last_scraped_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Stage 1: Raw RFPs (as scraped, before dedup)
-- ============================================================
CREATE TABLE raw_rfps (
    id              SERIAL PRIMARY KEY,
    source_id       INT NOT NULL REFERENCES scrape_sources(id),
    external_id     TEXT,                       -- ID from the source system if any
    title           TEXT,
    raw_url         TEXT,                       -- Original URL where this was found
    gcs_path        TEXT NOT NULL,              -- gs://bucket/path to raw file
    content_type    TEXT NOT NULL,              -- 'application/pdf', 'image/png', 'text/html', etc.
    content_hash    TEXT NOT NULL,              -- SHA-256 of raw content (used for dedup)
    file_size_bytes BIGINT,
    scraped_at      TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_raw_rfps_content_hash ON raw_rfps(content_hash);
CREATE INDEX idx_raw_rfps_source_id ON raw_rfps(source_id);

-- ============================================================
-- Stage 2: Deduplicated RFPs
-- ============================================================
CREATE TYPE rfp_status AS ENUM (
    'pending_parse',
    'parsing',
    'parsed',
    'parse_failed',
    'no_products'
);

CREATE TABLE rfps (
    id              SERIAL PRIMARY KEY,
    canonical_raw_id INT NOT NULL REFERENCES raw_rfps(id),  -- The "winner" from dedup
    content_hash    TEXT NOT NULL UNIQUE,                     -- Same as raw_rfps.content_hash
    title           TEXT,
    issuing_agency  TEXT,
    published_date  DATE,
    due_date        DATE,
    status          rfp_status DEFAULT 'pending_parse',
    duplicate_count INT DEFAULT 1,                            -- How many raw_rfps mapped here
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Track which raw_rfps are duplicates of which rfp
CREATE TABLE rfp_duplicate_map (
    id          SERIAL PRIMARY KEY,
    rfp_id      INT NOT NULL REFERENCES rfps(id),
    raw_rfp_id  INT NOT NULL REFERENCES raw_rfps(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rfp_id, raw_rfp_id)
);

-- ============================================================
-- Stage 3: Parsed Products (extracted from RFPs)
-- ============================================================
CREATE TYPE product_status AS ENUM (
    'pending_sourcing',
    'sourcing',
    'sourced',
    'no_match',
    'sourcing_failed'
);

CREATE TABLE parsed_products (
    id              SERIAL PRIMARY KEY,
    rfp_id          INT NOT NULL REFERENCES rfps(id),
    line_item_num   INT,                           -- Line item number within the RFP
    description     TEXT NOT NULL,
    quantity        INT,
    unit            TEXT,                           -- 'each', 'case', 'pallet', etc.
    specifications  JSONB DEFAULT '{}',             -- Parsed specs: brand, model, dimensions, etc.
    nsn             TEXT,                           -- National Stock Number if present
    status          product_status DEFAULT 'pending_sourcing',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parsed_products_rfp_id ON parsed_products(rfp_id);
CREATE INDEX idx_parsed_products_status ON parsed_products(status);

-- ============================================================
-- Stage 4: Sourcing Results
-- ============================================================
CREATE TYPE sourcing_match_status AS ENUM (
    'potential',
    'confirmed',
    'rejected',
    'unavailable'
);

CREATE TABLE sourcing_results (
    id              SERIAL PRIMARY KEY,
    product_id      INT NOT NULL REFERENCES parsed_products(id),
    merchant_name   TEXT NOT NULL,
    merchant_sku    TEXT,
    product_url     TEXT,
    unit_price      NUMERIC(12, 2),
    currency        TEXT DEFAULT 'USD',
    availability    TEXT,                           -- 'in_stock', 'backorder', 'limited', etc.
    lead_time_days  INT,
    match_confidence NUMERIC(5, 4),                -- 0.0000 to 1.0000
    match_status    sourcing_match_status DEFAULT 'potential',
    api_source      TEXT,                           -- Which sourcing API returned this
    raw_response    JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sourcing_results_product_id ON sourcing_results(product_id);

-- ============================================================
-- Stage 5: Ranked Bids
-- ============================================================
CREATE TYPE bid_status AS ENUM (
    'ranked',
    'pending_review',
    'approved',
    'rejected',
    'submitted'
);

CREATE TABLE ranked_bids (
    id                  SERIAL PRIMARY KEY,
    product_id          INT NOT NULL REFERENCES parsed_products(id),
    sourcing_result_id  INT NOT NULL REFERENCES sourcing_results(id),
    rfp_id              INT NOT NULL REFERENCES rfps(id),
    rank                INT NOT NULL,
    overall_score       NUMERIC(6, 4),
    -- Scoring breakdown
    margin_score        NUMERIC(6, 4),
    timeliness_score    NUMERIC(6, 4),
    geography_score     NUMERIC(6, 4),
    reliability_score   NUMERIC(6, 4),
    proposed_price      NUMERIC(12, 2),
    estimated_margin    NUMERIC(6, 4),             -- As a percentage
    status              bid_status DEFAULT 'ranked',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ranked_bids_rfp_id ON ranked_bids(rfp_id);
CREATE INDEX idx_ranked_bids_status ON ranked_bids(status);

-- ============================================================
-- Stage 6: Bid Reviews (Human-in-the-loop)
-- ============================================================
CREATE TYPE review_decision AS ENUM (
    'pending',
    'approved',
    'rejected',
    'needs_revision'
);

CREATE TABLE bid_reviews (
    id              SERIAL PRIMARY KEY,
    bid_id          INT NOT NULL REFERENCES ranked_bids(id),
    reviewer_email  TEXT,
    decision        review_decision DEFAULT 'pending',
    notes           TEXT,
    reviewed_at     TIMESTAMPTZ,
    submitted_at    TIMESTAMPTZ,                   -- When the bid was formally submitted
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bid_reviews_decision ON bid_reviews(decision);

-- ============================================================
-- Pipeline Run Tracking (for the control plane)
-- ============================================================
CREATE TYPE pipeline_stage AS ENUM (
    'scraping',
    'dedup',
    'parsing',
    'sourcing',
    'ranking',
    'review'
);

CREATE TYPE run_status AS ENUM (
    'running',
    'completed',
    'failed',
    'partial'
);

CREATE TABLE pipeline_runs (
    id              SERIAL PRIMARY KEY,
    stage           pipeline_stage NOT NULL,
    run_status      run_status DEFAULT 'running',
    items_input     INT DEFAULT 0,
    items_output    INT DEFAULT 0,
    items_error     INT DEFAULT 0,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    error_message   TEXT,
    metadata        JSONB DEFAULT '{}'
);

CREATE INDEX idx_pipeline_runs_stage ON pipeline_runs(stage);
CREATE INDEX idx_pipeline_runs_started_at ON pipeline_runs(started_at DESC);
