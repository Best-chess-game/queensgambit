CREATE TABLE public.games (
  id text PRIMARY KEY,
  fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  last_from text,
  last_to text,
  captured text,
  white_name text NOT NULL DEFAULT 'White',
  black_name text,
  white_char text NOT NULL DEFAULT 'pip',
  black_char text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view games" ON public.games FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.game_seats (
  game_id text NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  color text NOT NULL,
  token text NOT NULL,
  PRIMARY KEY (game_id, color)
);
GRANT ALL ON public.game_seats TO service_role;
ALTER TABLE public.game_seats ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION supabase_realtime ADD TABLE public.games;