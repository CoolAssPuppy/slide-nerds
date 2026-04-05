-- Seed data for local development
-- Run: cd apps && npx supabase db reset

-- Create test user
-- Email: test@strategicnerds.com / Password: password123
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'test@strategicnerds.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User","first_name":"Test","last_name":"User","company_name":"Strategic Nerds"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

insert into auth.identities (
  id,
  user_id,
  provider_id,
  provider,
  identity_data,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'test@strategicnerds.com'),
  now(),
  now(),
  now()
);

-- Update the profile created by the trigger
update public.profiles
set display_name = 'Test User'
where id = '00000000-0000-0000-0000-000000000001';

-- If the trigger didn't fire, create the profile
insert into public.profiles (id, display_name)
values ('00000000-0000-0000-0000-000000000001', 'Test User')
on conflict (id) do nothing;

-- Create a team subscription (highest tier) for the test user
insert into public.subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status)
values ('00000000-0000-0000-0000-000000000001', 'cus_test_000001', 'sub_test_000001', 'team', 'active');

-- No sample decks -- test user starts with a clean slate
