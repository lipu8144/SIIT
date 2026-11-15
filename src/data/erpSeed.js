/**
 * SIIT — Phase 4 seed data
 * Shapes mirror the Supabase tables defined in 0002_erp.sql.
 * Import from here into services/erpDb.js.
 */

export const students = [
  { id: "s1", enrollment_no: "SIIT/2024/001", name: "Raj Kishore Panda",   email: "raj@example.com",    phone: "9876543210", course_id: "c1", course_name: "OS-CIT",         batch: "Batch A 2024", address: "Sorada, Ganjam", status: "active",   joined_at: "2024-01-10" },
  { id: "s2", enrollment_no: "SIIT/2024/002", name: "Beenapani Nayak",     email: "bee@example.com",    phone: "9876543211", course_id: "c6", course_name: "Tally with GST",  batch: "Batch A 2024", address: "Sorada, Ganjam", status: "active",   joined_at: "2024-01-10" },
  { id: "s3", enrollment_no: "SIIT/2024/003", name: "Sukanta Panigrahi",   email: "suk@example.com",    phone: "9876543212", course_id: "c1", course_name: "OS-CIT",         batch: "Batch A 2024", address: "Berhampur",      status: "active",   joined_at: "2024-02-05" },
  { id: "s4", enrollment_no: "SIIT/2024/004", name: "Uma Shankar Panda",   email: "uma@example.com",    phone: "9876543213", course_id: "c4", course_name: "MS-Excel",        batch: "Batch B 2024", address: "Ganjam",         status: "active",   joined_at: "2024-02-05" },
  { id: "s5", enrollment_no: "SIIT/2024/005", name: "Priya Das",           email: "priya@example.com",  phone: "9876543214", course_id: "c5", course_name: "Photoshop",       batch: "Batch B 2024", address: "Sorada, Ganjam", status: "active",   joined_at: "2024-03-01" },
  { id: "s6", enrollment_no: "SIIT/2024/006", name: "Amit Kumar",          email: "amit@example.com",   phone: "9876543215", course_id: "c7", course_name: "C",               batch: "Batch B 2024", address: "Bhubaneswar",    status: "active",   joined_at: "2024-03-01" },
  { id: "s7", enrollment_no: "SIIT/2024/007", name: "Sneha Rath",          email: "sneha@example.com",  phone: "9876543216", course_id: "c6", course_name: "Tally with GST",  batch: "Batch C 2024", address: "Sorada, Ganjam", status: "inactive", joined_at: "2024-04-10" },
  { id: "s8", enrollment_no: "SIIT/2024/008", name: "Bijay Nayak",         email: "bijay@example.com",  phone: "9876543217", course_id: "c1", course_name: "OS-CIT",         batch: "Batch C 2024", address: "Chhatrapur",     status: "active",   joined_at: "2024-04-10" },
  { id: "s9", enrollment_no: "SIIT/2025/001", name: "Anita Sahu",          email: "anita@example.com",  phone: "9876543218", course_id: "c11","course_name": "Advanced Excel",batch: "Batch A 2025", address: "Ganjam",         status: "active",   joined_at: "2025-01-08" },
  { id: "s10",enrollment_no: "SIIT/2025/002", name: "Ravi Rout",           email: "ravi@example.com",   phone: "9876543219", course_id: "c9", course_name: "JAVA",            batch: "Batch A 2025", address: "Sorada, Ganjam", status: "active",   joined_at: "2025-01-08" },
];

export const teachers = [
  { id: "t1", name: "A. Mishra",      email: "mishra@siit.test",  phone: "9800000001", subjects: ["Web Development","C","C++","JAVA"], qualification: "MCA", experience_yrs: 8,  joined_at: "2016-06-01", status: "active" },
  { id: "t2", name: "R. Patra",       email: "patra@siit.test",   phone: "9800000002", subjects: ["Tally with GST","Advanced Excel","MS-Excel"], qualification: "M.Com", experience_yrs: 6, joined_at: "2018-07-15", status: "active" },
  { id: "t3", name: "S. Das",         email: "das@siit.test",     phone: "9800000003", subjects: ["Photoshop","Blender","Graphic Design"], qualification: "B.Sc Design", experience_yrs: 5, joined_at: "2019-03-01", status: "active" },
  { id: "t4", name: "K. Nanda",       email: "nanda@siit.test",   phone: "9800000004", subjects: ["OS-CIT","MS-Office","PowerPoint","MS-Word"], qualification: "BCA", experience_yrs: 4, joined_at: "2021-09-01", status: "active" },
];

export const managedCourses = [
  { id: "c1",  name: "OS-CIT",         category: "Computer",    duration_months: 3,  fee: 2500,  teacher_id: "t4", seats: 30, enrolled: 18, status: "active" },
  { id: "c4",  name: "MS-Excel",       category: "MS-Office",   duration_months: 2,  fee: 1500,  teacher_id: "t2", seats: 25, enrolled: 12, status: "active" },
  { id: "c5",  name: "Photoshop",      category: "Design",      duration_months: 3,  fee: 3000,  teacher_id: "t3", seats: 20, enrolled: 8,  status: "active" },
  { id: "c6",  name: "Tally with GST", category: "Account",     duration_months: 3,  fee: 3500,  teacher_id: "t2", seats: 25, enrolled: 15, status: "active" },
  { id: "c7",  name: "C",              category: "Programming", duration_months: 2,  fee: 2000,  teacher_id: "t1", seats: 20, enrolled: 6,  status: "active" },
  { id: "c9",  name: "JAVA",           category: "Programming", duration_months: 4,  fee: 4000,  teacher_id: "t1", seats: 20, enrolled: 10, status: "active" },
  { id: "c11", name: "Advanced Excel", category: "MS-Office",   duration_months: 2,  fee: 2000,  teacher_id: "t2", seats: 25, enrolled: 14, status: "active" },
];

// last 7 days of attendance for all active students
const today = new Date();
const dateStr = (d) => d.toISOString().split("T")[0];

export const attendance = [
  /* format: { id, student_id, student_name, date, status: P|A|L } */
  ...["s1","s2","s3","s4","s5","s6","s8","s9","s10"].flatMap((sid, i) =>
    Array.from({ length: 7 }, (_, d) => {
      const dt = new Date(today); dt.setDate(dt.getDate() - (6 - d));
      const statuses = ["P","P","P","A","P","P","L"];
      const name = students.find((s) => s.id === sid)?.name || sid;
      return { id: `att-${sid}-${d}`, student_id: sid, student_name: name, date: dateStr(dt), status: statuses[(i + d) % 7] };
    })
  ),
];

export const results = [
  { id: "r1",  student_id: "s1", student_name: "Raj Kishore Panda", course_id: "c1", course_name: "OS-CIT",        subject: "Computer Fundamentals", marks: 88, max_marks: 100, grade: "A",  published: true  },
  { id: "r2",  student_id: "s1", student_name: "Raj Kishore Panda", course_id: "c1", course_name: "OS-CIT",        subject: "MS-Office Practical",   marks: 92, max_marks: 100, grade: "A+", published: true  },
  { id: "r3",  student_id: "s2", student_name: "Beenapani Nayak",   course_id: "c6", course_name: "Tally with GST",subject: "Tally Theory",          marks: 78, max_marks: 100, grade: "B+", published: true  },
  { id: "r4",  student_id: "s2", student_name: "Beenapani Nayak",   course_id: "c6", course_name: "Tally with GST",subject: "GST Practical",          marks: 85, max_marks: 100, grade: "A",  published: true  },
  { id: "r5",  student_id: "s3", student_name: "Sukanta Panigrahi", course_id: "c1", course_name: "OS-CIT",        subject: "Computer Fundamentals", marks: 70, max_marks: 100, grade: "B",  published: true  },
  { id: "r6",  student_id: "s4", student_name: "Uma Shankar Panda", course_id: "c4", course_name: "MS-Excel",       subject: "Excel Theory",          marks: 95, max_marks: 100, grade: "A+", published: true  },
  { id: "r7",  student_id: "s5", student_name: "Priya Das",         course_id: "c5", course_name: "Photoshop",     subject: "Design Fundamentals",   marks: 82, max_marks: 100, grade: "A",  published: false },
  { id: "r8",  student_id: "s6", student_name: "Amit Kumar",        course_id: "c7", course_name: "C",             subject: "Programming Logic",     marks: 74, max_marks: 100, grade: "B+", published: true  },
  { id: "r9",  student_id: "s9", student_name: "Anita Sahu",        course_id: "c11","course_name": "Advanced Excel",subject:"Excel Advanced",        marks: 91, max_marks: 100, grade: "A+", published: true  },
  { id: "r10", student_id: "s10",student_name: "Ravi Rout",         course_id: "c9", course_name: "JAVA",          subject: "Java OOP",              marks: 68, max_marks: 100, grade: "B",  published: false },
];
