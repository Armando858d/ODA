CREATE TABLE store_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE package_profiles (
 product_id TEXT NOT NULL, variant INTEGER NOT NULL,
 weight REAL NOT NULL CHECK(weight>0), length REAL NOT NULL CHECK(length>0),
 width REAL NOT NULL CHECK(width>0), height REAL NOT NULL CHECK(height>0),
 PRIMARY KEY(product_id,variant),
 FOREIGN KEY(product_id,variant) REFERENCES inventory(product_id,variant)
);
CREATE TABLE shipping_quotes (
 id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, payload TEXT NOT NULL,
 carrier TEXT NOT NULL, service TEXT NOT NULL, description TEXT NOT NULL,
 total_cents INTEGER NOT NULL CHECK(total_cents>0), estimate TEXT NOT NULL,
 mode TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX shipping_quotes_expiry ON shipping_quotes(expires_at);
CREATE TABLE order_shipping (
 order_id TEXT PRIMARY KEY REFERENCES orders(id), quote_id TEXT NOT NULL UNIQUE REFERENCES shipping_quotes(id),
 state TEXT NOT NULL DEFAULT 'not_started', attempt_id TEXT,
 label_data TEXT, amount_cents INTEGER, updated_at INTEGER NOT NULL DEFAULT 0
);
