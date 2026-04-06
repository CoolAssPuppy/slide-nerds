-- Enable realtime for the decks table so the slides page updates live
ALTER PUBLICATION supabase_realtime ADD TABLE public.decks;
