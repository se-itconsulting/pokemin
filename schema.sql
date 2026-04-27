-- Schema-DDL for Pokemin TCG Database

-- Enable TimescaleDB extension if available
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- 1. Cards Table (Master Data)
CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY, -- e.g., 'swsh1-1' (from pokemontcg.io)
    name TEXT NOT NULL,
    supertype TEXT,
    subtypes TEXT[],
    hp TEXT,
    types TEXT[],
    evolves_from TEXT,
    set_id TEXT,
    set_name TEXT,
    series TEXT,
    number TEXT,
    artist TEXT,
    rarity TEXT,
    flavor_text TEXT,
    image_small TEXT,
    image_large TEXT,
    tcgplayer_url TEXT,
    cardmarket_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Card Prices Table (Timescale Hypertable)
CREATE TABLE IF NOT EXISTS card_prices (
    card_id TEXT NOT NULL REFERENCES cards(id),
    grade TEXT NOT NULL, -- e.g., 'Raw', 'PSA 7', 'PSA 8.5', 'PSA 9', 'PSA 10', 'Ungraded Mint'
    source TEXT NOT NULL, -- e.g., 'pricecharting', 'cardmarket', 'ebay'
    price_eur NUMERIC(10, 2) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (card_id, grade, source, recorded_at)
);

-- Convert to Timescale Hypertable
SELECT create_hypertable('card_prices', 'recorded_at', if_not_exists => TRUE);

-- 3. Portfolio Holdings
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- e.g., Clerk user ID
    card_id TEXT NOT NULL REFERENCES cards(id),
    grade TEXT NOT NULL,
    purchase_price_eur NUMERIC(10, 2),
    purchase_date DATE,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL REFERENCES cards(id),
    target_price_eur NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, card_id)
);

-- 5. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    card_id TEXT NOT NULL REFERENCES cards(id),
    grade TEXT NOT NULL,
    trigger_price_eur NUMERIC(10, 2) NOT NULL,
    direction TEXT CHECK (direction IN ('above', 'below')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
