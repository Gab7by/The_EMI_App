-- Delete all live podcast messages
-- This is a one-time cleanup migration to remove all existing messages
-- from the live_podcast_messages table.

DELETE FROM live_podcast_messages;
