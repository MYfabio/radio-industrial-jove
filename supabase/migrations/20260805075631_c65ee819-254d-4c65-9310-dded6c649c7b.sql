CREATE TABLE public.podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  "desc" text,
  cat text,
  author text,
  tags text[] NOT NULL DEFAULT '{}',
  audio_url text NOT NULL,
  transcript text,
  dur integer,
  status text NOT NULL DEFAULT 'pendent',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.podcasts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.podcasts TO authenticated;
GRANT ALL ON public.podcasts TO service_role;

ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a podcast as pending"
  ON public.podcasts FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pendent');

CREATE POLICY "Approved podcasts are public"
  ON public.podcasts FOR SELECT
  TO anon, authenticated
  USING (status = 'aprovat');