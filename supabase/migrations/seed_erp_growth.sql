-- ════════════════════════════════════════════════════════════
-- SIIT — ERP + Growth seed data
-- Run AFTER all migrations. Seeds teachers, courses, students, leads.
-- Attendance and results can be added from the admin dashboard.
-- ════════════════════════════════════════════════════════════

-- ── teachers ─────────────────────────────────────────────────
insert into public.teachers (name, email, phone, subjects, qualification, experience_yrs, status, joined_at) values
  ('A. Mishra',  'mishra@siit.test', '9800000001', '{Web Development,C,C++,JAVA}',           'MCA',         8, 'active', '2016-06-01'),
  ('R. Patra',   'patra@siit.test',  '9800000002', '{Tally with GST,Advanced Excel,MS-Excel}','M.Com',       6, 'active', '2018-07-15'),
  ('S. Das',     'das@siit.test',    '9800000003', '{Photoshop,Blender,Graphic Design}',      'B.Sc Design', 5, 'active', '2019-03-01'),
  ('K. Nanda',   'nanda@siit.test',  '9800000004', '{OS-CIT,MS-Office,PowerPoint,MS-Word}',   'BCA',         4, 'active', '2021-09-01');

-- ── managed_courses (use teacher IDs from above — we'll reference by subquery) ──
insert into public.managed_courses (name, category, duration_months, fee, teacher_id, seats, enrolled, status) values
  ('OS-CIT',         'Computer',    3, 2500, (select id from public.teachers where email='nanda@siit.test' limit 1), 30, 18, 'active'),
  ('MS-Excel',       'MS-Office',   2, 1500, (select id from public.teachers where email='patra@siit.test' limit 1), 25, 12, 'active'),
  ('Photoshop',      'Design',      3, 3000, (select id from public.teachers where email='das@siit.test'   limit 1), 20,  8, 'active'),
  ('Tally with GST', 'Account',     3, 3500, (select id from public.teachers where email='patra@siit.test' limit 1), 25, 15, 'active'),
  ('C',              'Programming', 2, 2000, (select id from public.teachers where email='mishra@siit.test'limit 1), 20,  6, 'active'),
  ('JAVA',           'Programming', 4, 4000, (select id from public.teachers where email='mishra@siit.test'limit 1), 20, 10, 'active'),
  ('Advanced Excel', 'MS-Office',   2, 2000, (select id from public.teachers where email='patra@siit.test' limit 1), 25, 14, 'active');

-- ── students ─────────────────────────────────────────────────
insert into public.students (enrollment_no, name, email, phone, course_name, batch, address, status, joined_at) values
  ('SIIT/2024/001', 'Raj Kishore Panda', 'raj@example.com',   '9876543210', 'OS-CIT',         'Batch A 2024', 'Sorada, Ganjam', 'active',   '2024-01-10'),
  ('SIIT/2024/002', 'Beenapani Nayak',   'bee@example.com',   '9876543211', 'Tally with GST',  'Batch A 2024', 'Sorada, Ganjam', 'active',   '2024-01-10'),
  ('SIIT/2024/003', 'Sukanta Panigrahi', 'suk@example.com',   '9876543212', 'OS-CIT',         'Batch A 2024', 'Berhampur',      'active',   '2024-02-05'),
  ('SIIT/2024/004', 'Uma Shankar Panda', 'uma@example.com',   '9876543213', 'MS-Excel',        'Batch B 2024', 'Ganjam',         'active',   '2024-02-05'),
  ('SIIT/2024/005', 'Priya Das',         'priya@example.com', '9876543214', 'Photoshop',       'Batch B 2024', 'Sorada, Ganjam', 'active',   '2024-03-01'),
  ('SIIT/2024/006', 'Amit Kumar',        'amit@example.com',  '9876543215', 'C',               'Batch B 2024', 'Bhubaneswar',    'active',   '2024-03-01'),
  ('SIIT/2024/007', 'Sneha Rath',        'sneha@example.com', '9876543216', 'Tally with GST',  'Batch C 2024', 'Sorada, Ganjam', 'inactive', '2024-04-10'),
  ('SIIT/2024/008', 'Bijay Nayak',       'bijay@example.com', '9876543217', 'OS-CIT',         'Batch C 2024', 'Chhatrapur',     'active',   '2024-04-10'),
  ('SIIT/2025/001', 'Anita Sahu',        'anita@example.com', '9876543218', 'Advanced Excel',  'Batch A 2025', 'Ganjam',         'active',   '2025-01-08'),
  ('SIIT/2025/002', 'Ravi Rout',         'ravi@example.com',  '9876543219', 'JAVA',            'Batch A 2025', 'Sorada, Ganjam', 'active',   '2025-01-08');

-- ── leads ────────────────────────────────────────────────────
insert into public.leads (name, phone, email, course_interest, source, status, remarks, created_at) values
  ('Ananya Behera',  '9777100001', 'ananya@example.com',   'Tally with GST', 'Walk-in',   'new',        '',                          '2026-06-01T09:00:00Z'),
  ('Subham Dash',    '9777100002', 'subham@example.com',   'OS-CIT',         'Instagram', 'contacted',  'Called on 2 Jun',           '2026-06-02T10:30:00Z'),
  ('Mamata Sahu',    '9777100003', 'mamata@example.com',   'Photoshop',      'WhatsApp',  'interested', 'Demo scheduled for 10 Jun', '2026-06-03T11:00:00Z'),
  ('Pradeep Jena',   '9777100004', 'pradeep@example.com',  'Advanced Excel', 'Website',   'follow_up',  'Follow up on fee discount', '2026-06-04T08:00:00Z'),
  ('Rina Tripathy',  '9777100005', 'rina@example.com',     'OS-CIT',         'Referral',  'converted',  'Enrolled Batch A Jul',      '2026-06-05T14:00:00Z');

-- ── enrollments (link seeded students to courses) ───────────
-- Uses subqueries because Supabase generates UUIDs, not fixed ids.
insert into public.enrollments (student_id, course_id, status, progress, enrolled_at)
select s.id, c.id, 'active', p.progress, s.joined_at
from (values
  ('SIIT/2024/001', 'OS-CIT',         65),
  ('SIIT/2024/001', 'Tally with GST', 30),
  ('SIIT/2024/002', 'Tally with GST', 80),
  ('SIIT/2024/003', 'OS-CIT',         45),
  ('SIIT/2024/004', 'MS-Excel',       55),
  ('SIIT/2024/005', 'Photoshop',      70),
  ('SIIT/2024/006', 'C',              40),
  ('SIIT/2025/001', 'Advanced Excel', 25),
  ('SIIT/2025/002', 'JAVA',           35)
) as p(enroll_no, course_name, progress)
join public.students s        on s.enrollment_no = p.enroll_no
join public.managed_courses c on c.name = p.course_name
on conflict (student_id, course_id) do nothing;

-- ── link the demo student account to a student row (optional) ──
-- After creating the client's students in Supabase Auth, connect each
-- auth user to their student row so the portal shows THEIR data:
--   UPDATE public.students SET user_id = 'AUTH_UID' WHERE enrollment_no = 'SIIT/2024/001';

-- ── sample results (so the student Results tab & report card work) ──
insert into public.results (student_id, student_name, subject, marks, max_marks, grade, published)
select s.id, s.name, r.subject, r.marks, 100, r.grade, true
from (values
  ('SIIT/2024/001', 'Computer Fundamentals', 82, 'A'),
  ('SIIT/2024/001', 'MS-Office',             75, 'B+'),
  ('SIIT/2024/001', 'Internet & Email',      90, 'A+'),
  ('SIIT/2024/002', 'Tally Basics',          78, 'B+'),
  ('SIIT/2024/002', 'GST Configuration',     85, 'A'),
  ('SIIT/2024/003', 'Computer Fundamentals', 70, 'B+')
) as r(enroll_no, subject, marks, grade)
join public.students s on s.enrollment_no = r.enroll_no;

-- ── sample attendance for the last few days (current month) ─────────
insert into public.attendance (student_id, student_name, date, status)
select s.id, s.name, d.day::date, 'P'
from public.students s
cross join (
  select generate_series(date_trunc('month', current_date), current_date, interval '1 day') as day
) d
where s.enrollment_no in ('SIIT/2024/001','SIIT/2024/002','SIIT/2024/003')
  and extract(dow from d.day) not in (0)   -- skip Sundays
on conflict (student_id, date) do nothing;
