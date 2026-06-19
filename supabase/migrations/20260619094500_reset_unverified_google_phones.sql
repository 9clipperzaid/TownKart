-- Existing Google-created profiles may have inherited the old TRUE default.
-- Google login only collects the phone number; OTP verification is what marks it verified.
UPDATE public.profiles
SET is_verified = false
WHERE provider = 'google' OR phone IS NULL;
