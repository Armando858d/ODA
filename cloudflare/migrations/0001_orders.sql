CREATE TABLE inventory (
 product_id TEXT NOT NULL, variant INTEGER NOT NULL,
 stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
 PRIMARY KEY(product_id, variant)
);
CREATE TABLE orders (
 id TEXT PRIMARY KEY, request_key TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL,
 items TEXT NOT NULL, customer TEXT NOT NULL, total_cents INTEGER NOT NULL CHECK(total_cents>0),
 shipping_cents INTEGER NOT NULL CHECK(shipping_cents>=0), state TEXT NOT NULL,
 preference_id TEXT, checkout_url TEXT, created_at INTEGER NOT NULL,
 checked_at INTEGER NOT NULL DEFAULT 0, mode TEXT NOT NULL CHECK(mode IN ('test','live'))
);
CREATE TABLE order_items (
 order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT NOT NULL,
 variant INTEGER NOT NULL, quantity INTEGER NOT NULL CHECK(quantity BETWEEN 1 AND 20),
 PRIMARY KEY(order_id,product_id,variant),
 FOREIGN KEY(product_id,variant) REFERENCES inventory(product_id,variant)
);
-- Any unavailable item aborts the D1 batch, including the order and all earlier reservations.
CREATE TRIGGER reserve_check BEFORE INSERT ON order_items BEGIN
 SELECT RAISE(ABORT,'insufficient_stock')
 WHERE COALESCE((SELECT stock FROM inventory WHERE product_id=NEW.product_id AND variant=NEW.variant),0)<NEW.quantity;
END;
CREATE TRIGGER reserve_stock AFTER INSERT ON order_items BEGIN
 UPDATE inventory SET stock=stock-NEW.quantity WHERE product_id=NEW.product_id AND variant=NEW.variant;
END;
CREATE TABLE payments (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), status TEXT NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX payments_order ON payments(order_id);
CREATE INDEX orders_created ON orders(created_at);
