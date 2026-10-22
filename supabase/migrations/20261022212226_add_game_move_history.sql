-- Preserve full notation alongside the current FEN. Existing games begin recording
-- at their current position; earlier moves cannot be recovered from a FEN alone.
alter table public.games add column if not exists pgn text not null default '';
