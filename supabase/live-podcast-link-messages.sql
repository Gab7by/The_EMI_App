-- Run this once in the Supabase SQL Editor before testing link messages.
-- It adds a durable link message type and the URL/optional display label.

alter table public.live_podcast_messages
  add column if not exists link_url text,
  add column if not exists link_label text;

alter table public.live_podcast_messages
  drop constraint if exists live_podcast_messages_message_type_check;

alter table public.live_podcast_messages
  add constraint live_podcast_messages_message_type_check
  check (message_type in ('text', 'image', 'link', 'system'));

alter table public.live_podcast_messages
  drop constraint if exists live_podcast_messages_link_url_check;

alter table public.live_podcast_messages
  add constraint live_podcast_messages_link_url_check
  check (
    (message_type <> 'link')
    or (link_url is not null and link_url ~ '^https://')
  );
