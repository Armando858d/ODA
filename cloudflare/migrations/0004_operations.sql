ALTER TABLE orders ADD COLUMN inventory_released INTEGER NOT NULL DEFAULT 0 CHECK(inventory_released IN (0,1));
ALTER TABLE orders ADD COLUMN fulfillment_hold INTEGER NOT NULL DEFAULT 0 CHECK(fulfillment_hold IN (0,1));
ALTER TABLE orders ADD COLUMN ops_checked_at INTEGER NOT NULL DEFAULT 0;
CREATE TRIGGER release_inventory AFTER UPDATE OF inventory_released ON orders
WHEN OLD.inventory_released=0 AND NEW.inventory_released=1 BEGIN
 UPDATE inventory SET stock=stock+COALESCE((SELECT quantity FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND variant=inventory.variant),0)
 WHERE EXISTS(SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND variant=inventory.variant);
END;
CREATE TRIGGER reclaim_inventory_check BEFORE UPDATE OF inventory_released ON orders
WHEN OLD.inventory_released=1 AND NEW.inventory_released=0 BEGIN
 SELECT RAISE(ABORT,'insufficient_stock') WHERE EXISTS(SELECT 1 FROM order_items oi JOIN inventory i ON i.product_id=oi.product_id AND i.variant=oi.variant WHERE oi.order_id=NEW.id AND i.stock<oi.quantity);
END;
CREATE TRIGGER reclaim_inventory AFTER UPDATE OF inventory_released ON orders
WHEN OLD.inventory_released=1 AND NEW.inventory_released=0 BEGIN
 UPDATE inventory SET stock=stock-COALESCE((SELECT quantity FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND variant=inventory.variant),0)
 WHERE EXISTS(SELECT 1 FROM order_items WHERE order_id=NEW.id AND product_id=inventory.product_id AND variant=inventory.variant);
END;
CREATE TABLE notifications (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), kind TEXT NOT NULL,
 payload TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'queued', attempts INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL, first_attempt INTEGER, lease_until INTEGER NOT NULL DEFAULT 0,
 provider_id TEXT, last_error TEXT, UNIQUE(order_id,kind)
);
CREATE INDEX notifications_pending ON notifications(state,lease_until);
CREATE TABLE operation_issues (
 order_id TEXT NOT NULL REFERENCES orders(id), kind TEXT NOT NULL, message TEXT NOT NULL,
 updated_at INTEGER NOT NULL, PRIMARY KEY(order_id,kind)
);
