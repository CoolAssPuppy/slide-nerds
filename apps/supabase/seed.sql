-- Seed data for local development
-- Run: cd apps && npx supabase db reset

-- ============================================================================
-- Users
-- ============================================================================

-- Prashant Sridharan (Senior Account Executive at Acme Corp)
-- Email: prashant@example.com / Password: password123
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'test@strategicnerds.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Prashant Sridharan","first_name":"Prashant","last_name":"Sridharan","company_name":"Acme Corp"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'test@strategicnerds.com'),
  now(), now(), now()
);

-- Team member 1: Diana Prince (Wonder Woman) -- Solutions Engineer
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'diana.prince@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Diana Prince","first_name":"Diana","last_name":"Prince","company_name":"Acme Corp"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000002', 'email', 'diana.prince@example.com'),
  now(), now(), now()
);

-- Team member 2: Bruce Wayne (Batman) -- VP of Sales
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'bruce.wayne@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Bruce Wayne","first_name":"Bruce","last_name":"Wayne","company_name":"Acme Corp"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000003', 'email', 'bruce.wayne@example.com'),
  now(), now(), now()
);

-- Team member 3: Clark Kent (Superman) -- Sales Manager
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'clark.kent@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Clark Kent","first_name":"Clark","last_name":"Kent","company_name":"Acme Corp"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000004',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000004', 'email', 'clark.kent@example.com'),
  now(), now(), now()
);

-- Team member 4: Barry Allen (The Flash) -- Sales Development Rep
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'barry.allen@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Barry Allen","first_name":"Barry","last_name":"Allen","company_name":"Acme Corp"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000005',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000005', 'email', 'barry.allen@example.com'),
  now(), now(), now()
);

-- Team member 5: Arthur Curry (Aquaman) -- Customer Success Manager
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) values (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'arthur.curry@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Arthur Curry","first_name":"Arthur","last_name":"Curry","company_name":"Acme Corp"}',
  now(), now(), '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000006',
  'email',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000006', 'email', 'arthur.curry@example.com'),
  now(), now(), now()
);

-- ============================================================================
-- Profiles (trigger creates them, but we update with full details)
-- ============================================================================

update public.profiles set display_name = 'Prashant Sridharan', first_name = 'Prashant', last_name = 'Sridharan', company_name = 'Acme Corp'
where id = '00000000-0000-0000-0000-000000000001';

insert into public.profiles (id, display_name, first_name, last_name, company_name)
values ('00000000-0000-0000-0000-000000000001', 'Prashant Sridharan', 'Prashant', 'Sridharan', 'Acme Corp')
on conflict (id) do nothing;

update public.profiles set display_name = 'Diana Prince', first_name = 'Diana', last_name = 'Prince', company_name = 'Acme Corp'
where id = '00000000-0000-0000-0000-000000000002';

insert into public.profiles (id, display_name, first_name, last_name, company_name)
values ('00000000-0000-0000-0000-000000000002', 'Diana Prince', 'Diana', 'Prince', 'Acme Corp')
on conflict (id) do nothing;

update public.profiles set display_name = 'Bruce Wayne', first_name = 'Bruce', last_name = 'Wayne', company_name = 'Acme Corp'
where id = '00000000-0000-0000-0000-000000000003';

insert into public.profiles (id, display_name, first_name, last_name, company_name)
values ('00000000-0000-0000-0000-000000000003', 'Bruce Wayne', 'Bruce', 'Wayne', 'Acme Corp')
on conflict (id) do nothing;

update public.profiles set display_name = 'Clark Kent', first_name = 'Clark', last_name = 'Kent', company_name = 'Acme Corp'
where id = '00000000-0000-0000-0000-000000000004';

insert into public.profiles (id, display_name, first_name, last_name, company_name)
values ('00000000-0000-0000-0000-000000000004', 'Clark Kent', 'Clark', 'Kent', 'Acme Corp')
on conflict (id) do nothing;

update public.profiles set display_name = 'Barry Allen', first_name = 'Barry', last_name = 'Allen', company_name = 'Acme Corp'
where id = '00000000-0000-0000-0000-000000000005';

insert into public.profiles (id, display_name, first_name, last_name, company_name)
values ('00000000-0000-0000-0000-000000000005', 'Barry Allen', 'Barry', 'Allen', 'Acme Corp')
on conflict (id) do nothing;

update public.profiles set display_name = 'Arthur Curry', first_name = 'Arthur', last_name = 'Curry', company_name = 'Acme Corp'
where id = '00000000-0000-0000-0000-000000000006';

insert into public.profiles (id, display_name, first_name, last_name, company_name)
values ('00000000-0000-0000-0000-000000000006', 'Arthur Curry', 'Arthur', 'Curry', 'Acme Corp')
on conflict (id) do nothing;

-- ============================================================================
-- Subscriptions
-- ============================================================================

insert into public.subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status)
values ('00000000-0000-0000-0000-000000000001', 'cus_test_000001', 'sub_test_000001', 'team', 'active');

-- ============================================================================
-- Team: Acme Corp Sales
-- ============================================================================

insert into public.teams (id, name, slug, owner_id)
values ('00000000-0000-0000-0000-0000000000a1', 'Acme Corp Sales', 'acme-corp-sales', '00000000-0000-0000-0000-000000000001');

insert into public.team_members (team_id, user_id, role) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000002', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000003', 'admin'),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000004', 'admin'),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000005', 'member'),
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000006', 'member');

-- ============================================================================
-- Decks: 4 owned by Prashant
-- ============================================================================

insert into public.decks (id, owner_id, team_id, name, slug, description, slide_count, is_public, source_type) values
  (
    '00000000-0000-0000-0000-00000000d001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    'Acme Platform Q2 Sales Deck',
    'acme-q2-sales-deck',
    'Main sales pitch deck for Acme Platform targeting mid-market prospects. Covers value proposition, pricing tiers, customer case studies, and ROI calculator.',
    18,
    false,
    'push'
  ),
  (
    '00000000-0000-0000-0000-00000000d002',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    'Wayne Enterprises Discovery Call',
    'wayne-enterprises-discovery',
    'Custom discovery deck for the Wayne Enterprises opportunity. Includes their tech stack analysis, pain points from the initial call, and proposed integration roadmap.',
    12,
    false,
    'push'
  ),
  (
    '00000000-0000-0000-0000-00000000d003',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    'Quarterly Business Review Template',
    'qbr-template',
    'Reusable QBR template for existing customers. Usage metrics, health score, expansion opportunities, and renewal timeline.',
    14,
    false,
    'push'
  ),
  (
    '00000000-0000-0000-0000-00000000d004',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-0000000000a1',
    'Mutual Action Plan -- LexCorp Deal',
    'lexcorp-mutual-action-plan',
    'Collaborative close plan for the LexCorp enterprise deal. Timeline, stakeholder map, technical validation steps, and procurement milestones.',
    9,
    false,
    'push'
  );

-- ============================================================================
-- Decks: 7 shared with Prashant (owned by team members, on the team)
-- ============================================================================

-- Diana Prince (Solutions Engineer) shares technical content
insert into public.decks (id, owner_id, team_id, name, slug, description, slide_count, is_public, source_type) values
  (
    '00000000-0000-0000-0000-00000000d005',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    'Acme Platform Technical Architecture Overview',
    'acme-technical-architecture',
    'Deep dive into platform architecture for technical buyers. Covers security, compliance, API surface, and integration patterns.',
    22,
    false,
    'push'
  ),
  (
    '00000000-0000-0000-0000-00000000d006',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-0000000000a1',
    'Security and Compliance Whitepaper Deck',
    'security-compliance-deck',
    'SOC 2, GDPR, and HIPAA compliance overview for procurement and security teams. Includes data residency options and encryption details.',
    16,
    false,
    'push'
  );

-- Bruce Wayne (VP of Sales) shares strategy decks
insert into public.decks (id, owner_id, team_id, name, slug, description, slide_count, is_public, source_type) values
  (
    '00000000-0000-0000-0000-00000000d007',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-0000000000a1',
    'FY26 Sales Kickoff -- Go-to-Market Strategy',
    'fy26-sales-kickoff-gtm',
    'Annual kickoff presentation covering territory plans, new product positioning, competitive battlecards, and quota targets for the year.',
    34,
    false,
    'push'
  );

-- Clark Kent (Sales Manager) shares enablement content
insert into public.decks (id, owner_id, team_id, name, slug, description, slide_count, is_public, source_type) values
  (
    '00000000-0000-0000-0000-00000000d008',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-0000000000a1',
    'Competitive Battlecard -- Globex vs Acme',
    'competitive-battlecard-globex',
    'Head-to-head comparison against Globex Corp. Win/loss analysis, objection handling scripts, and differentiators by vertical.',
    11,
    false,
    'push'
  ),
  (
    '00000000-0000-0000-0000-00000000d009',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-0000000000a1',
    'New Hire Sales Onboarding -- Week 1',
    'sales-onboarding-week-1',
    'First week onboarding for new AEs. Product fundamentals, ICP definition, demo environment setup, and CRM workflow.',
    28,
    false,
    'push'
  );

-- Barry Allen (SDR) shares prospecting decks
insert into public.decks (id, owner_id, team_id, name, slug, description, slide_count, is_public, source_type) values
  (
    '00000000-0000-0000-0000-00000000d010',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-0000000000a1',
    'Outbound Prospecting Playbook',
    'outbound-prospecting-playbook',
    'Cold outreach sequences, email templates, and LinkedIn messaging frameworks for enterprise and mid-market verticals.',
    15,
    false,
    'push'
  );

-- Arthur Curry (Customer Success) shares retention content
insert into public.decks (id, owner_id, team_id, name, slug, description, slide_count, is_public, source_type) values
  (
    '00000000-0000-0000-0000-00000000d011',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-0000000000a1',
    'Customer Health Score Framework',
    'customer-health-score-framework',
    'How we measure account health: product usage, NPS, support tickets, and executive engagement. Includes churn risk indicators and expansion signals.',
    19,
    false,
    'push'
  );

-- ============================================================================
-- Brand config: Strategic Nerds, Inc.
-- ============================================================================

insert into public.brand_configs (id, owner_id, name, config)
values (
  '00000000-0000-0000-0000-0000000000b1',
  '00000000-0000-0000-0000-000000000001',
  'Strategic Nerds',
  '{
    "colors": {
      "primary": "#FDB817",
      "accent": "#FCDE09",
      "background": "#121212",
      "surface": "#1E1E1E",
      "text": "#F5F5F5"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter",
      "mono": "JetBrains Mono"
    },
    "spacing": {
      "slide": 64,
      "section": 32,
      "element": 16
    }
  }'::jsonb
);
