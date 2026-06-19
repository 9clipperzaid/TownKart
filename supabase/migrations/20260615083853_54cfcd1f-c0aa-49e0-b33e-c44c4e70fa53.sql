
-- Roles
CREATE TYPE public.app_role AS ENUM ('customer','seller','rider','admin');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Stores
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  delivery_minutes INT NOT NULL DEFAULT 30,
  min_order NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active stores" ON public.stores FOR SELECT USING (is_active = TRUE);

-- Products
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'each',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available products" ON public.products FOR SELECT USING (is_available = TRUE);
CREATE INDEX idx_products_store ON public.products(store_id);

-- Cart items (one row per product per user)
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart" ON public.cart_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  store_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed',
  total NUMERIC(10,2) NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = customer_id);
CREATE POLICY "Customers create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);

-- Order items
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));
CREATE POLICY "Customers create own order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.customer_id = auth.uid()));

-- OTP codes (managed server-side via service role only; no client access)
CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.otp_codes TO service_role;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_otp_phone ON public.otp_codes(phone);

-- Seed stores + products
DO $$
DECLARE s1 UUID; s2 UUID; s3 UUID; s4 UUID; s5 UUID; s6 UUID;
BEGIN
  INSERT INTO public.stores (name, description, category, rating, delivery_minutes, min_order)
    VALUES ('FreshKart Grocery','Daily fruits, vegetables & essentials','grocery',4.6,20,99) RETURNING id INTO s1;
  INSERT INTO public.stores (name, description, category, rating, delivery_minutes, min_order)
    VALUES ('Spice Route Kitchen','Authentic home-style Indian meals','restaurant',4.8,35,149) RETURNING id INTO s2;
  INSERT INTO public.stores (name, description, category, rating, delivery_minutes, min_order)
    VALUES ('Golden Crust Bakery','Fresh breads, cakes & pastries','bakery',4.7,25,0) RETURNING id INTO s3;
  INSERT INTO public.stores (name, description, category, rating, delivery_minutes, min_order)
    VALUES ('CareWell Pharmacy','Medicines & wellness, fast delivery','pharmacy',4.5,15,0) RETURNING id INTO s4;
  INSERT INTO public.stores (name, description, category, rating, delivery_minutes, min_order)
    VALUES ('Bloom & Petal','Fresh flowers & gift bouquets','flowers',4.9,40,0) RETURNING id INTO s5;
  INSERT INTO public.stores (name, description, category, rating, delivery_minutes, min_order)
    VALUES ('GadgetHub Electronics','Accessories, chargers & gadgets','electronics',4.4,45,0) RETURNING id INTO s6;

  INSERT INTO public.products (store_id, name, description, price, unit) VALUES
    (s1,'Bananas','Fresh ripe bananas',49,'dozen'),
    (s1,'Tomatoes','Farm fresh tomatoes',32,'kg'),
    (s1,'Milk 1L','Full cream milk',64,'pack'),
    (s1,'Brown Eggs','Free-range eggs',89,'6 pcs'),
    (s1,'Basmati Rice','Premium long grain',120,'kg'),
    (s2,'Butter Chicken','Creamy tomato gravy',249,'plate'),
    (s2,'Paneer Tikka','Char-grilled cottage cheese',229,'plate'),
    (s2,'Veg Biryani','Fragrant rice & veggies',199,'plate'),
    (s2,'Garlic Naan','Soft tandoor bread',49,'2 pcs'),
    (s3,'Sourdough Loaf','Slow-fermented artisan bread',150,'loaf'),
    (s3,'Butter Croissant','Flaky French croissant',70,'each'),
    (s3,'Chocolate Cake','Rich fudge slice',120,'slice'),
    (s3,'Blueberry Muffin','Bakery fresh muffin',60,'each'),
    (s4,'Paracetamol 500mg','Fever & pain relief',35,'strip'),
    (s4,'Vitamin C','Immunity tablets',180,'bottle'),
    (s4,'Hand Sanitizer','75% alcohol, 200ml',99,'bottle'),
    (s4,'Digital Thermometer','Fast read',299,'each'),
    (s5,'Red Rose Bouquet','12 fresh red roses',599,'bouquet'),
    (s5,'Mixed Daisies','Cheerful seasonal mix',399,'bunch'),
    (s5,'Orchid Pot','Elegant potted orchid',749,'pot'),
    (s6,'USB-C Charger','30W fast charger',699,'each'),
    (s6,'Wireless Earbuds','Bluetooth 5.3',1499,'pair'),
    (s6,'Power Bank 10000mAh','Slim portable charger',999,'each'),
    (s6,'Phone Stand','Adjustable aluminium',349,'each');
END $$;
