-- Demo data so the CRM can be tried without sending anything real.
-- Every business here is fictional, flagged is_demo = true, uses example.com emails (a reserved
-- domain that can never receive mail) and 555-01xx phone numbers (reserved for fiction).
-- Remove it all with:  delete from public.businesses where is_demo;

insert into public.businesses
  (id, name, category, address, city, county, phone, email, email_source, email_confidence, website_url,
   web_presence, website_issues, facebook_url, google_rating, review_count, services, years_in_business,
   is_family_business, source, is_demo, hours)
values
  ('00000000-0000-4000-a000-000000000001', 'Rivera Family Lawn Care', 'Lawn care', '101 Demo St', 'High Point', 'Guilford',
   '(336) 555-0101', 'demo-rivera@example.com', 'google_business_listing', 0.95, null, 'none', '{}', null, 4.9, 27,
   '{"Mowing","Edging","Leaf removal","Mulch"}', 8, true, 'seed', true,
   '{"mon":"7-6","tue":"7-6","wed":"7-6","thu":"7-6","fri":"7-6","sat":"8-2"}'),
  ('00000000-0000-4000-a000-000000000002', 'Nguyen''s Nail Studio', 'Nail salon', '22 Sample Ave', 'Greensboro', 'Guilford',
   '(336) 555-0102', 'demo-nguyen@example.com', 'facebook_about', 0.9, null, 'facebook_only', '{}',
   'https://facebook.com/example', 4.7, 64, '{"Manicures","Pedicures","Gel","Dip powder"}', 5, true, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000003', 'Summit Roofing & Exteriors', 'Roofing', '9 Test Pkwy', 'Winston-Salem', 'Forsyth',
   '(336) 555-0103', 'demo-summit@example.com', 'existing_website', 0.85, 'https://example.com/summit', 'weak_site',
   '{"Not mobile friendly","No click-to-call","Copyright says 2014"}', null, 4.8, 212,
   '{"Roof replacement","Repairs","Gutters","Siding"}', 22, false, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000004', 'Bea''s Home Bakery', 'Bakery', '5 Example Ln', 'Thomasville', 'Davidson',
   '(336) 555-0104', null, null, null, null, 'social_only', '{}', null, 5.0, 18,
   '{"Custom cakes","Cupcakes","Cookies"}', 3, true, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000005', 'Carter HVAC Services', 'HVAC', '77 Mock Rd', 'Charlotte', 'Mecklenburg',
   '(704) 555-0105', 'demo-carter@example.com', 'google_business_listing', 0.95, null, 'none', '{}', null, 4.6, 141,
   '{"AC repair","Heating","Installs","Maintenance plans"}', 15, false, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000006', 'Joe''s Barber Shop', 'Barber', '3 Placeholder St', 'Lexington', 'Davidson',
   '(336) 555-0106', 'demo-joes@example.com', 'yelp', 0.8, null, 'none', '{}', null, 4.8, 39,
   '{"Haircuts","Fades","Beard trims"}', 12, true, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000007', 'Patel Family Dental', 'Dental', '400 Sample Blvd', 'Raleigh', 'Wake',
   '(919) 555-0107', 'demo-patel@example.com', 'existing_website', 0.9, 'https://example.com/patel', 'weak_site',
   '{"Slow to load","No online booking"}', null, 4.9, 188, '{"Cleanings","Fillings","Crowns","Whitening"}', 11, false, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000008', 'Greenway Pressure Washing', 'Pressure washing', '12 Fake Ct', 'Kernersville', 'Forsyth',
   '(336) 555-0108', 'demo-greenway@example.com', 'facebook_about', 0.85, null, 'facebook_only', '{}',
   'https://facebook.com/example', 4.9, 22, '{"House washing","Driveways","Decks"}', 2, true, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000009', 'Holloway Auto Repair', 'Auto repair', '8 Demo Hwy', 'Asheboro', 'Randolph',
   '(336) 555-0109', 'demo-holloway@example.com', 'bbb', 0.8, null, 'none', '{}', null, 4.5, 56,
   '{"Brakes","Oil changes","Diagnostics"}', 19, true, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000010', 'Main Street Florist', 'Florist', '1 Example Main St', 'Burlington', 'Alamance',
   '(336) 555-0110', 'demo-florist@example.com', 'google_business_listing', 0.95, null, 'none', '{}', null, 4.8, 73,
   '{"Weddings","Funerals","Daily arrangements"}', 9, true, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000011', 'Oakline Painting Co.', 'Painting', '6 Test Ave', 'Durham', 'Durham',
   '(919) 555-0111', 'demo-oakline@example.com', 'existing_website', 0.9, 'https://example.com/oakline', 'weak_site',
   '{"Placeholder text on home page"}', null, 4.7, 95, '{"Interior","Exterior","Cabinets"}', 7, false, 'seed', true, null),
  ('00000000-0000-4000-a000-000000000012', 'Lucy''s Pet Grooming', 'Pet grooming', '15 Sample Rd', 'Jamestown', 'Guilford',
   '(336) 555-0112', 'demo-lucy@example.com', 'instagram_bio', 0.75, null, 'social_only', '{}', null, 4.9, 31,
   '{"Baths","Haircuts","Nail trims"}', 4, true, 'seed', true, null);

insert into public.contacts (business_id, name, role, email, phone, is_primary) values
  ('00000000-0000-4000-a000-000000000001', 'Luis Rivera', 'Owner', 'demo-rivera@example.com', '(336) 555-0101', true),
  ('00000000-0000-4000-a000-000000000002', 'Kim Nguyen', 'Owner', 'demo-nguyen@example.com', null, true),
  ('00000000-0000-4000-a000-000000000005', 'Dana Carter', 'Owner', 'demo-carter@example.com', null, true),
  ('00000000-0000-4000-a000-000000000006', 'Joe Simmons', 'Owner', 'demo-joes@example.com', '(336) 555-0106', true),
  ('00000000-0000-4000-a000-000000000010', 'Grace Lee', 'Owner', 'demo-florist@example.com', null, true);

insert into public.business_assessment
  (business_id, quality_score, size_signal, recommended_tier, setup_price, monthly_price, reasoning, rules_applied)
values
  ('00000000-0000-4000-a000-000000000001', 62, 'family_solo', 'basic', 400, 85,
   'Owner''s name in business name, one location, 27 reviews. Family business, so capped at Basic and priced below the ceiling.',
   '{"family_cap","lean_low_under_30_reviews"}'),
  ('00000000-0000-4000-a000-000000000002', 58, 'family_solo', 'basic', 450, 90,
   'Facebook-only, owner-run, 64 reviews. Family cap applies.', '{"family_cap"}'),
  ('00000000-0000-4000-a000-000000000003', 84, 'established', 'premium', 950, 145,
   'Roofing (high-ticket), 212 reviews, 22 years. Existing site is outdated. Premium fits.', '{"premium_category","100_plus_reviews"}'),
  ('00000000-0000-4000-a000-000000000004', 40, 'family_solo', 'basic', 300, 75,
   'Home bakery, 18 reviews, 3 years. Very small, so priced at the low end.', '{"family_cap","home_based_lean_lower"}'),
  ('00000000-0000-4000-a000-000000000005', 80, 'established', 'premium', 900, 140,
   'HVAC (high-ticket), 141 reviews, 15 years, no website.', '{"premium_category","100_plus_reviews"}'),
  ('00000000-0000-4000-a000-000000000006', 55, 'family_solo', 'basic', 400, 85, 'Single-chair shop, family run.', '{"family_cap"}'),
  ('00000000-0000-4000-a000-000000000007', 88, 'premium', 'all_out', 1800, 225,
   'Dental practice, 188 reviews, wants booking. All-Out fits.', '{"premium_category","100_plus_reviews"}'),
  ('00000000-0000-4000-a000-000000000008', 45, 'family_solo', 'basic', 350, 80, 'New business, 22 reviews.', '{"family_cap","lean_low_under_30_reviews"}'),
  ('00000000-0000-4000-a000-000000000009', 60, 'family_solo', 'basic', 450, 95, 'Family-owned shop, 19 years.', '{"family_cap"}'),
  ('00000000-0000-4000-a000-000000000010', 63, 'family_solo', 'basic', 450, 90, 'Small florist, one location.', '{"family_cap"}'),
  ('00000000-0000-4000-a000-000000000011', 70, 'small', 'premium', 800, 130, 'Crew-based painter, 95 reviews.', '{}'),
  ('00000000-0000-4000-a000-000000000012', 50, 'family_solo', 'basic', 350, 80, 'Solo groomer.', '{"family_cap"}');

insert into public.pipeline (business_id, stage, lead_score, owner, next_action, next_action_at, stage_changed_at) values
  ('00000000-0000-4000-a000-000000000001', 'replied',         92, 'acen', 'approve_reply',         now(),                      now() - interval '1 hour'),
  ('00000000-0000-4000-a000-000000000002', 'emailed',         74, 'auto', 'send_follow_up_1',      now() + interval '2 days',  now() - interval '1 day'),
  ('00000000-0000-4000-a000-000000000003', 'payment_clicked', 95, 'auto', 'send_payment_nudge',    now() + interval '20 hours', now() - interval '4 hours'),
  ('00000000-0000-4000-a000-000000000004', 'needs_call',      70, 'acen', 'call',                  now(),                      now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000005', 'demo_built',      81, 'auto', 'send_first_email',      now() + interval '14 hours', now() - interval '6 hours'),
  ('00000000-0000-4000-a000-000000000006', 'follow_up_1',     66, 'auto', 'send_follow_up_2',      now() + interval '4 days',  now() - interval '3 days'),
  ('00000000-0000-4000-a000-000000000007', 'call_booked',     90, 'acen', 'call',                  now() + interval '1 day',   now() - interval '1 day'),
  ('00000000-0000-4000-a000-000000000008', 'priced',          60, 'auto', 'build_demo',            now() + interval '3 hours', now() - interval '2 hours'),
  ('00000000-0000-4000-a000-000000000009', 'new',             55, 'auto', 'assess',                now() + interval '1 hour',  now()),
  ('00000000-0000-4000-a000-000000000010', 'retainer_active', 100,'auto', null,                    null,                       now() - interval '20 days'),
  ('00000000-0000-4000-a000-000000000011', 'later',           45, 'auto', 'resurface',             now() + interval '80 days', now() - interval '10 days'),
  ('00000000-0000-4000-a000-000000000012', 'building',        100,'auto', 'post_preview_in_portal',now() + interval '1 day',   now() - interval '1 day');

update public.pipeline set resurface_at = now() + interval '80 days' where business_id = '00000000-0000-4000-a000-000000000011';

insert into public.demo_sites (business_id, tier_shown, url, qa_passed, views, unique_views, last_viewed_at) values
  ('00000000-0000-4000-a000-000000000001', 'basic',   'https://rivera-family-lawn-care.preview.example.com', true, 6, 2, now() - interval '2 hours'),
  ('00000000-0000-4000-a000-000000000002', 'basic',   'https://nguyens-nail-studio.preview.example.com',     true, 0, 0, null),
  ('00000000-0000-4000-a000-000000000003', 'premium', 'https://summit-roofing.preview.example.com',          true, 9, 3, now() - interval '4 hours'),
  ('00000000-0000-4000-a000-000000000004', 'basic',   'https://beas-home-bakery.preview.example.com',        true, 0, 0, null),
  ('00000000-0000-4000-a000-000000000005', 'premium', 'https://carter-hvac.preview.example.com',             true, 0, 0, null),
  ('00000000-0000-4000-a000-000000000006', 'basic',   'https://joes-barber-shop.preview.example.com',        true, 2, 1, now() - interval '1 day'),
  ('00000000-0000-4000-a000-000000000007', 'all_out', 'https://patel-family-dental.preview.example.com',     true, 4, 2, now() - interval '1 day');

insert into public.messages (business_id, thread_id, channel, direction, subject, body, status, ai_classification,
                             ai_confidence, auto_sent, written_by, sent_at, created_at) values
  ('00000000-0000-4000-a000-000000000001', 'demo-thread-1', 'email', 'outbound', 'website for Rivera Family Lawn Care',
   'Hey Luis, I run a small agency that builds websites for local businesses around High Point...', 'sent', null, null,
   true, 'ai', now() - interval '2 days', now() - interval '2 days'),
  ('00000000-0000-4000-a000-000000000001', 'demo-thread-1', 'email', 'inbound', 'Re: website for Rivera Family Lawn Care',
   'This looks great. Can you add a page for our spring cleanup special? And what''s the deal if I want to cancel later?',
   'received', 'interested_with_questions', 0.71, false, 'lead', null, now() - interval '1 hour'),
  ('00000000-0000-4000-a000-000000000001', 'demo-thread-1', 'email', 'outbound', 'Re: website for Rivera Family Lawn Care',
   'Hey Luis, glad you like it. I can add a spring cleanup section, just send me what you''d like it to say. If you ever want to cancel, the site stays up through the month you''ve paid for, then comes down. No fees, no contract. Ready when you are: [payment link]',
   'pending_approval', 'interested_with_questions', 0.71, false, 'ai', null, now() - interval '50 minutes'),
  ('00000000-0000-4000-a000-000000000002', 'demo-thread-2', 'email', 'outbound', 'website for Nguyen''s Nail Studio',
   'Hey Kim, I found Nguyen''s Nail Studio through your Facebook page...', 'sent', null, null, true, 'ai',
   now() - interval '1 day', now() - interval '1 day');

insert into public.payment_links (business_id, tier, setup_price, monthly_price, stripe_session_url, created_at, clicked_at) values
  ('00000000-0000-4000-a000-000000000003', 'premium', 950, 145, 'https://example.com/demo-checkout', now() - interval '2 days', now() - interval '4 hours');

insert into public.calls (business_id, scheduled_at) values
  ('00000000-0000-4000-a000-000000000007', now() + interval '1 day');

insert into public.clients (id, business_id, tier, setup_price, monthly_price, retainer_status, live_url, start_date,
                            edits_used_this_month, next_billing_at) values
  ('00000000-0000-4000-b000-000000000010', '00000000-0000-4000-a000-000000000010', 'basic', 450, 90, 'active',
   'https://main-street-florist.example.com', current_date - 20, 1, now() + interval '10 days'),
  ('00000000-0000-4000-b000-000000000012', '00000000-0000-4000-a000-000000000012', 'basic', 350, 80, 'pending',
   null, current_date - 1, 0, null);

insert into public.client_costs (client_id, month, hosting, domain, email, ai_usage, stripe_fees) values
  ('00000000-0000-4000-b000-000000000010', date_trunc('month', current_date), 2.00, 1.50, 0, 0.80, 2.91);

insert into public.project_progress (client_id, step, status, note) values
  ('00000000-0000-4000-b000-000000000010', 'paid', 'done', null),
  ('00000000-0000-4000-b000-000000000010', 'details_received', 'done', null),
  ('00000000-0000-4000-b000-000000000010', 'building', 'done', null),
  ('00000000-0000-4000-b000-000000000010', 'preview_ready', 'done', null),
  ('00000000-0000-4000-b000-000000000010', 'approved', 'done', null),
  ('00000000-0000-4000-b000-000000000010', 'live', 'done', 'Live on your domain.'),
  ('00000000-0000-4000-b000-000000000012', 'paid', 'done', null),
  ('00000000-0000-4000-b000-000000000012', 'details_received', 'done', 'Got your logo and 6 photos.'),
  ('00000000-0000-4000-b000-000000000012', 'building', 'current', 'Building your site now.'),
  ('00000000-0000-4000-b000-000000000012', 'preview_ready', 'pending', null),
  ('00000000-0000-4000-b000-000000000012', 'approved', 'pending', null),
  ('00000000-0000-4000-b000-000000000012', 'live', 'pending', null);

insert into public.edit_requests (client_id, request_text, category, status, auto_handled) values
  ('00000000-0000-4000-b000-000000000010', 'Can you swap the top photo for the new Valentine''s arrangement?', 'included', 'live', true);

insert into public.tasks (business_id, kind, title, detail, priority) values
  ('00000000-0000-4000-a000-000000000001', 'approve_message', 'Approve reply to Rivera Family Lawn Care',
   'AI confidence was 71%, below your 80% threshold. Read the draft and tap Approve or Edit.', 90),
  ('00000000-0000-4000-a000-000000000004', 'call', 'Call Bea''s Home Bakery',
   'No public email found. Demo is ready; script and price are on the call card.', 70);

insert into public.sending_inboxes (address, domain, display_name, daily_cap, warmup_day, health) values
  ('demo-inbox@example.com', 'example.com', 'Acen (demo inbox)', 15, 0, 'good');

insert into public.style_rules (rule_text, source, status) values
  ('Keep first emails under 100 words.', 'instruction', 'active'),
  ('Use the owner''s first name when we know it.', 'instruction', 'active');

insert into public.reply_library (situation_type, inbound_text, response_text, source, outcome) values
  ('asks_about_cancel', 'What if I want to cancel?',
   'No contract at all. If you cancel, the site stays up through the month you''ve paid for, then comes down. No fees.', 'seed', null);

insert into public.activity_log (business_id, actor, action, detail, created_at) values
  ('00000000-0000-4000-a000-000000000003', 'lead', 'payment_link_clicked', '{}', now() - interval '4 hours'),
  ('00000000-0000-4000-a000-000000000001', 'lead', 'email_reply_received', '{}', now() - interval '1 hour'),
  ('00000000-0000-4000-a000-000000000001', 'ai',   'drafted_reply', '{"confidence":0.71,"pinned_for_acen":true}', now() - interval '50 minutes'),
  ('00000000-0000-4000-a000-000000000005', 'ai',   'demo_built', '{"qa_passed":true}', now() - interval '6 hours'),
  ('00000000-0000-4000-a000-000000000009', 'system', 'lead_found', '{"source":"google_places"}', now() - interval '10 minutes');
