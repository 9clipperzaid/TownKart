-- Run this in Supabase SQL Editor after you log in once with Google.
-- Replace the email below with your login Gmail.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

WITH target_user AS (
  SELECT id, email
  FROM auth.users
  WHERE lower(email) = lower('zaid67mohd@gmail.com')
  LIMIT 1
)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM target_user
ON CONFLICT (user_id, role) DO NOTHING;

-- Optional check: this should show your admin role after running the insert.
SELECT
  u.id,
  u.email,
  r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE lower(u.email) = lower('zaid67mohd@gmail.com');
