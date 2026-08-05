CREATE POLICY "Anyone can upload podcast audio"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'audio');

CREATE POLICY "Anyone can read podcast audio"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'audio');