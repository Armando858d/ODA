CREATE TABLE IF NOT EXISTS custom_requests (
 id TEXT PRIMARY KEY, request_key TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL,
 name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
 piece TEXT NOT NULL, quantity INTEGER NOT NULL, size TEXT NOT NULL, details TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'new', quote_cents INTEGER, internal_notes TEXT NOT NULL DEFAULT '',
 created_at INTEGER NOT NULL
);
