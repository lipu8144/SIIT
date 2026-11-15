-- ════════════════════════════════════════════════════════════
-- SIIT — seed data (run AFTER 0001_init.sql)
-- Mirrors src/data/seed.js so a fresh Supabase project shows the
-- same content the app shows in dummy mode.
-- Note: users/auth are created via Supabase Auth signup, not seeded
-- here (the on_auth_user_created trigger creates their profile row).
-- ════════════════════════════════════════════════════════════

insert into public.blogs (title, slug, excerpt, body, author, category, tags, status, featured, publish_at) values
('Why OS-CIT is the best first step into an IT career','oscit-first-step-it-career','A government-recognised certification that opens doors to office and computer-operator roles across Odisha.','OS-CIT covers computer fundamentals, MS-Office, the internet, and digital governance — the exact skills employers expect for entry-level roles.','SIIT Faculty','Career','{OS-CIT,career,certification}','published',true,'2026-06-12T09:00:00Z'),
('5 Excel formulas every accountant must know','5-excel-formulas-accountants','From VLOOKUP to SUMIFS — the formulas that save hours every week.','Spreadsheets run on a handful of high-leverage formulas.','SIIT Faculty','Tutorials','{excel,accounting}','published',false,'2026-06-08T09:00:00Z'),
('How Beenapani landed a Salesforce role','beenapani-salesforce-placement','A student success story from our placement program.','After completing her course at SIIT, Beenapani prepared for interviews.','Placement Cell','Placements','{placement,success-story}','published',false,'2026-06-02T09:00:00Z'),
('Tally + GST: a complete beginner roadmap','tally-gst-beginner-roadmap','Everything a beginner needs to start with Tally and GST accounting.','Tally with GST remains one of the most employable accounting skills.','SIIT Faculty','Career','{tally,gst,accounting}','published',false,'2026-05-28T09:00:00Z'),
('Photoshop basics: your first poster in an hour','photoshop-first-poster','Layers, text and export — a hands-on intro to Adobe Photoshop.','Design is a skill anyone can start learning today.','SIIT Faculty','Tutorials','{photoshop,design}','published',false,'2026-05-20T09:00:00Z')
on conflict (slug) do nothing;

insert into public.events (title, slug, description, starts_at, ends_at, location, status, registration_open, capacity) values
('OS-CIT July Batch — Orientation','oscit-july-orientation','Kick-off and orientation for the new OS-CIT batch.','2026-07-01T04:30:00Z','2026-07-01T06:30:00Z','SIIT Campus, Sorada','published',true,60),
('Free Career Counselling Day','career-counselling-day','One-on-one guidance on choosing the right course and career path.','2026-07-15T04:00:00Z','2026-07-15T10:00:00Z','SIIT Campus, Sorada','published',true,100),
('Annual Certificate Distribution 2025','certificate-distribution-2025','Celebrating our certified students of 2025.','2025-12-20T05:00:00Z','2025-12-20T08:00:00Z','SIIT Campus, Sorada','published',false,null)
on conflict (slug) do nothing;

insert into public.gallery (album, type, caption) values
('Campus','image','Computer lab'),
('Events','image','Certificate day 2025'),
('Classroom','image','Tally class in session'),
('Campus','image','Reception'),
('Events','video','Orientation highlights'),
('Classroom','image','Design workshop');

insert into public.testimonials (name, photo_url, course, review, rating, achievement, featured) values
('Raj Kishore Panda','https://lh3.googleusercontent.com/a/ACg8ocLbM3Bx6dAZJeiJruyRa28hzWV_0frHWq2qRXx9q0Woa-fW1A=w75-h75-p-rp-mo-br100','OS-CIT','The best institute in our locality. Faculties are well behaved and teach well.',5,'Certified',true),
('Beenapani Nayak','https://lh3.googleusercontent.com/a/ACg8ocKZ252maztLpoBIpBqZnxStyZeJzugXO6Q9Agd296gCMlYWjaI=w75-h75-p-rp-mo-br100','Salesforce','An excellent organization. The instructor was superb and gave me the best career advice.',5,'Placed',true),
('Sukanta Panigrahi','https://lh3.googleusercontent.com/a/ACg8ocLImTv_aH_9nkX9v5mbQo-Wwy0q9wRUEEMnUVcG6J3loMQxYis=w75-h75-p-rp-mo-br100','Computer Basics','Very good institute in our area for computer learning.',4,'Certified',false),
('Uma Shankar Panda','https://lh3.googleusercontent.com/a-/ALV-UjUjMSSqm4NTQ68wtebuRQHvuAJY7KzwWTS4qxwqf2V-1x4gtc8=w75-h75-p-rp-mo-br100','Multiple Courses','The best computer institute in Sorada. All the faculty are very helpful.',5,'Certified',false);

insert into public.notifications (type, title, body, cta_label, cta_href, active) values
('admission','Admissions Open 2026','New OS-CIT batch starts July 1.','Apply now','/courses',true);
