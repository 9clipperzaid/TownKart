-- Phone numbers are unverified until the OTP verifier explicitly marks them verified.
ALTER TABLE public.profiles
  ALTER COLUMN is_verified SET DEFAULT false;
