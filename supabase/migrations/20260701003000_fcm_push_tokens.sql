CREATE TABLE IF NOT EXISTS public.fcm_push_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fcm_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own FCM tokens" ON public.fcm_push_tokens;
CREATE POLICY "Users can view own FCM tokens"
ON public.fcm_push_tokens
FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own FCM tokens" ON public.fcm_push_tokens;
CREATE POLICY "Users can delete own FCM tokens"
ON public.fcm_push_tokens
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS fcm_push_tokens_user_id_idx ON public.fcm_push_tokens(user_id);
