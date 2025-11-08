-- Migration: 002_seed_data.sql
-- Purpose: Example seed data for development and testing.
-- NOTE: Do NOT use this file to create real auth users. Replace <REPLACE_WITH_USER_UUID>
-- with a real user UUID from your Supabase project's `auth.users` table if you want tasks tied to a user.

-- Sample task for a placeholder user. Replace user_id with an existing user's UUID.
INSERT INTO public.tasks (id, title, completed, user_id)
VALUES (
  gen_random_uuid(),
  'Welcome — try creating tasks',
  false,
  '<REPLACE_WITH_USER_UUID>'
);

-- Additional example tasks (optional)
INSERT INTO public.tasks (id, title, completed, user_id)
VALUES (gen_random_uuid(), 'Second task example', false, '<REPLACE_WITH_USER_UUID>');

-- If you want to seed programmatically, consider using the Supabase Admin API or server-side scripts
-- which can create real auth users, then insert related rows here.
