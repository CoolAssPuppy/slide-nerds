-- Enable realtime for brand_configs so the brands page updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_configs;
