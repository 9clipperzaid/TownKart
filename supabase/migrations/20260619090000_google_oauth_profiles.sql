-- Google OAuth profile metadata.
-- Future OTP re-enable point: keep phone on profiles; these provider fields let
-- Google and SMS auth coexist without changing customer-facing records later.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'phone',
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_provider ON public.profiles(provider);
