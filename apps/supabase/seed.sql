-- Test account for local development
-- Email: test@strategicnerds.com / Password: password123

-- Create the auth user (Supabase local dev uses this format)
insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  role,
  aud,
  created_at,
  updated_at
) values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '00000000-0000-0000-0000-000000000000',
  'test@strategicnerds.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"full_name": "Test User"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) on conflict (id) do nothing;

-- Create identity for the user
insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '{"sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "email": "test@strategicnerds.com"}'::jsonb,
  'email',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  now(),
  now(),
  now()
) on conflict do nothing;

-- The profile is auto-created by the handle_new_user trigger,
-- but since we're inserting directly into auth.users, trigger it manually
insert into public.profiles (id, display_name, avatar_url)
values ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Test User', null)
on conflict (id) do nothing;

-- Create a free subscription
insert into public.subscriptions (user_id, plan, status)
values ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'free', 'active')
on conflict do nothing;
