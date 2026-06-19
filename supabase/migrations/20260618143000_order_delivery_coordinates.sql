-- Store customer-selected delivery map coordinates on orders.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_latitude double precision,
  ADD COLUMN IF NOT EXISTS delivery_longitude double precision,
  ADD COLUMN IF NOT EXISTS delivery_location_accuracy double precision;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_latitude_range'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_latitude_range
      CHECK (delivery_latitude IS NULL OR delivery_latitude BETWEEN -90 AND 90);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_longitude_range'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_longitude_range
      CHECK (delivery_longitude IS NULL OR delivery_longitude BETWEEN -180 AND 180);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_delivery_location_pair'
      AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_delivery_location_pair
      CHECK (
        (delivery_latitude IS NULL AND delivery_longitude IS NULL)
        OR (delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL)
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_coordinates
  ON public.orders(delivery_latitude, delivery_longitude)
  WHERE delivery_latitude IS NOT NULL AND delivery_longitude IS NOT NULL;
