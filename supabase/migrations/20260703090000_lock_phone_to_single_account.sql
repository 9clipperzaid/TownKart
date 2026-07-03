-- Keep phone identity canonical and enforce one phone per customer account.
-- The application additionally prevents an existing account from replacing
-- its linked number during a later Google login.

UPDATE public.profiles
SET phone = NULLIF(regexp_replace(phone, '[^0-9]', '', 'g'), '')
WHERE phone IS NOT NULL;

CREATE OR REPLACE FUNCTION public.normalize_profile_phone()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
     AND OLD.phone IS NOT NULL
     AND NULLIF(regexp_replace(COALESCE(NEW.phone, ''), '[^0-9]', '', 'g'), '')
         IS DISTINCT FROM NULLIF(regexp_replace(OLD.phone, '[^0-9]', '', 'g'), '') THEN
    RAISE EXCEPTION 'Linked phone number cannot be changed'
      USING ERRCODE = '23514';
  END IF;
  IF NEW.phone IS NOT NULL THEN
    NEW.phone := NULLIF(regexp_replace(NEW.phone, '[^0-9]', '', 'g'), '');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_profile_phone_before_write ON public.profiles;
CREATE TRIGGER normalize_profile_phone_before_write
BEFORE INSERT OR UPDATE OF phone ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.normalize_profile_phone();

CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_canonical_unique
ON public.profiles (phone)
WHERE phone IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_unique
ON public.profiles (lower(email))
WHERE email IS NOT NULL AND btrim(email) <> '';
