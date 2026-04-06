INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);

CREATE POLICY "Authenticated users can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'brand-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can read logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-logos');

CREATE POLICY "Users can delete own logos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'brand-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
