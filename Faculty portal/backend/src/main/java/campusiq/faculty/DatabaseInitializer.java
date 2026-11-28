package campusiq.faculty;

import java.sql.Connection;
import java.sql.Statement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public final class DatabaseInitializer {
    private DatabaseInitializer() {}

    public static void initialize() throws Exception {
        try (Connection c = DatabaseConnection.getConnection();
             Statement s = c.createStatement()) {
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS faculty (
                    faculty_id TEXT PRIMARY KEY,
                    full_name TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    password_hash TEXT NOT NULL,
                    phone TEXT DEFAULT '',
                    date_of_birth TEXT DEFAULT '',
                    gender TEXT DEFAULT '',
                    address TEXT DEFAULT '',
                    designation TEXT DEFAULT 'Assistant Professor',
                    department TEXT DEFAULT 'Computer Science & Engineering',
                    qualification TEXT DEFAULT '',
                    experience TEXT DEFAULT '',
                    joining_date TEXT DEFAULT '',
                    active INTEGER NOT NULL DEFAULT 1
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS courses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT NOT NULL,
                    code TEXT NOT NULL,
                    title TEXT NOT NULL,
                    department TEXT DEFAULT '',
                    semester INTEGER DEFAULT 1,
                    credits INTEGER DEFAULT 0,
                    students INTEGER DEFAULT 0,
                    description TEXT DEFAULT '',
                    FOREIGN KEY(faculty_id) REFERENCES faculty(faculty_id)
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT NOT NULL,
                    student_id TEXT NOT NULL,
                    student_name TEXT NOT NULL,
                    course TEXT NOT NULL,
                    attendance_date TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('Present','Absent','Late')),
                    FOREIGN KEY(faculty_id) REFERENCES faculty(faculty_id)
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    course TEXT NOT NULL,
                    description TEXT DEFAULT '',
                    due_date TEXT NOT NULL,
                    maximum_marks INTEGER DEFAULT 100,
                    status TEXT DEFAULT 'Active',
                    submissions INTEGER DEFAULT 0,
                    total_students INTEGER DEFAULT 0,
                    FOREIGN KEY(faculty_id) REFERENCES faculty(faculty_id)
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS grades (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT NOT NULL,
                    student_id TEXT NOT NULL,
                    student_name TEXT NOT NULL,
                    course TEXT NOT NULL,
                    marks REAL NOT NULL,
                    total_marks REAL NOT NULL DEFAULT 100,
                    FOREIGN KEY(faculty_id) REFERENCES faculty(faculty_id)
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS timetable (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT NOT NULL,
                    day TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    course TEXT NOT NULL,
                    course_code TEXT DEFAULT '',
                    classroom TEXT DEFAULT '',
                    section TEXT DEFAULT '',
                    session_type TEXT DEFAULT 'Lecture',
                    FOREIGN KEY(faculty_id) REFERENCES faculty(faculty_id)
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT DEFAULT 'Academic',
                    description TEXT DEFAULT '',
                    event_date TEXT NOT NULL,
                    event_time TEXT DEFAULT '',
                    venue TEXT DEFAULT '',
                    status TEXT DEFAULT 'Upcoming'
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS announcements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT DEFAULT 'General',
                    priority TEXT DEFAULT 'Normal',
                    body TEXT DEFAULT '',
                    posted_by TEXT DEFAULT 'Academic Office',
                    posted_date TEXT DEFAULT CURRENT_DATE
                )
            """);
            s.executeUpdate("""
                CREATE TABLE IF NOT EXISTS leaves (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faculty_id TEXT NOT NULL,
                    leave_type TEXT NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'Pending',
                    applied_on TEXT DEFAULT CURRENT_DATE,
                    FOREIGN KEY(faculty_id) REFERENCES faculty(faculty_id)
                )
            """);
        }
        seed();
    }

    private static String hash(String value) throws Exception {
        byte[] bytes = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        StringBuilder out = new StringBuilder();
        for (byte b : bytes) out.append(String.format("%02x", b));
        return out.toString();
    }

    private static void seed() throws Exception {
        try (Connection c = DatabaseConnection.getConnection()) {
            try (PreparedStatement q = c.prepareStatement("SELECT COUNT(*) FROM faculty");
                 ResultSet r = q.executeQuery()) {
                if (r.next() && r.getInt(1) == 0) {
                    try (PreparedStatement p = c.prepareStatement("""
                        INSERT INTO faculty(faculty_id,full_name,email,password_hash,phone,designation,department,qualification,experience,joining_date,address)
                        VALUES(?,?,?,?,?,?,?,?,?,?,?)
                    """)) {
                        p.setString(1,"FAC-2026-001"); p.setString(2,"Dr. Priya Sharma");
                        p.setString(3,"faculty@campusiq.edu"); p.setString(4,hash("Faculty@123"));
                        p.setString(5,"9876543210"); p.setString(6,"Assistant Professor");
                        p.setString(7,"Computer Science & Engineering"); p.setString(8,"M.Tech Computer Science");
                        p.setString(9,"6 Years"); p.setString(10,"2021-06-15");
                        p.setString(11,"CampusIQ Faculty Department"); p.executeUpdate();
                    }
                }
            }
            String fid = "FAC-2026-001";
            seedCourses(c,fid); seedAttendance(c,fid); seedAssignments(c,fid);
            seedGrades(c,fid); seedTimetable(c,fid); seedEvents(c); seedAnnouncements(c); seedLeaves(c,fid);
        }
    }

    private static boolean empty(Connection c, String table) throws Exception {
        try (Statement s=c.createStatement(); ResultSet r=s.executeQuery("SELECT COUNT(*) FROM "+table)) {
            return r.next() && r.getInt(1)==0;
        }
    }
    private static void seedCourses(Connection c,String f) throws Exception {
        if(!empty(c,"courses")) return;
        String[][] rows={{"CS301","Java Programming","52","3","3"},{"CS302","Data Structures","48","4","3"},{"CS303","Database Management","44","4","3"},{"CS304","Web Technologies","42","3","3"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO courses(faculty_id,code,title,department,students,credits,semester) VALUES(?,?,?,?,?,?,?)")){
            for(String[] x:rows){p.setString(1,f);p.setString(2,x[0]);p.setString(3,x[1]);p.setString(4,"Computer Science & Engineering");p.setInt(5,Integer.parseInt(x[2]));p.setInt(6,Integer.parseInt(x[3]));p.setInt(7,Integer.parseInt(x[4]));p.addBatch();} p.executeBatch();
        }
    }
    private static void seedAttendance(Connection c,String f) throws Exception {
        if(!empty(c,"attendance")) return;
        String[][] a={{"GMU001","Aarav Sharma","Java Programming","Present"},{"GMU002","Ananya Rao","Data Structures","Absent"},{"GMU003","Rohan Kumar","Database Management","Present"},{"GMU004","Diya Reddy","Web Technologies","Present"},{"GMU005","Arjun Patel","Java Programming","Absent"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO attendance(faculty_id,student_id,student_name,course,attendance_date,status) VALUES(?,?,?,?,CURRENT_DATE,?)")){
            for(String[] x:a){p.setString(1,f);p.setString(2,x[0]);p.setString(3,x[1]);p.setString(4,x[2]);p.setString(5,x[3]);p.addBatch();}p.executeBatch();
        }
    }
    private static void seedAssignments(Connection c,String f) throws Exception {
        if(!empty(c,"assignments")) return;
        String[][] a={{"Object-Oriented Programming","Java Programming","Develop a Java application demonstrating classes, objects, inheritance and polymorphism.","2026-11-30","20","Active","32","45"},{"Data Structures Analysis","Data Structures","Analyse arrays, linked lists, stacks and queues with suitable examples.","2026-12-03","25","Active","24","40"},{"Database Design Project","Database Management","Design a relational database and demonstrate SQL queries and normalization.","2026-11-20","30","Closed","40","45"},{"Responsive Website Development","Web Technologies","Build a responsive website using HTML, CSS and JavaScript.","2026-12-05","25","Active","18","40"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO assignments(faculty_id,title,course,description,due_date,maximum_marks,status,submissions,total_students) VALUES(?,?,?,?,?,?,?,?,?)")){
            for(String[] x:a){p.setString(1,f);for(int i=0;i<8;i++)p.setString(i+2,x[i]);p.addBatch();}p.executeBatch();
        }
    }
    private static void seedGrades(Connection c,String f) throws Exception {
        if(!empty(c,"grades")) return;
        String[][] a={{"GMU101","Rahul Sharma","Java Programming","92","100"},{"GMU102","Priya Kumar","Data Structures","85","100"},{"GMU103","Arjun Reddy","Java Programming","76","100"},{"GMU104","Sneha Rao","Database Management","48","100"},{"GMU105","Vikram Patel","Data Structures","68","100"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO grades(faculty_id,student_id,student_name,course,marks,total_marks) VALUES(?,?,?,?,?,?)")){
            for(String[] x:a){p.setString(1,f);for(int i=0;i<4;i++)p.setString(i+2,x[i]);p.setDouble(6,Double.parseDouble(x[4]));p.addBatch();}p.executeBatch();
        }
    }
    private static void seedTimetable(Connection c,String f) throws Exception {
        if(!empty(c,"timetable")) return;
        String[][] a={{"Monday","09:00","10:00","Java Programming","CS301","Room 204","A","Lecture"},{"Monday","11:00","12:00","Data Structures","CS302","Lab 02","B","Practical"},{"Tuesday","10:00","11:00","Database Management","CS303","Room 105","A","Lecture"},{"Tuesday","13:00","15:00","Java Programming","CS301","Lab 01","B","Practical"},{"Wednesday","09:00","10:00","Data Structures","CS302","Room 203","A","Lecture"},{"Wednesday","11:00","12:00","Database Management","CS303","Lab 03","B","Practical"},{"Thursday","10:00","11:00","Web Technologies","CS304","Room 106","A","Lecture"},{"Thursday","13:00","15:00","Data Structures","CS302","Lab 02","B","Practical"},{"Friday","09:00","10:00","Java Programming","CS301","Room 204","A","Lecture"},{"Friday","11:00","12:00","Web Technologies","CS304","Room 106","B","Lecture"},{"Saturday","09:00","11:00","Web Technologies","CS304","Lab 04","A","Practical"},{"Saturday","11:00","12:00","Faculty Mentoring","MENTOR","Room 204","A","Meeting"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO timetable(faculty_id,day,start_time,end_time,course,course_code,classroom,section,session_type) VALUES(?,?,?,?,?,?,?,?,?)")){
            for(String[] x:a){p.setString(1,f);for(int i=0;i<8;i++)p.setString(i+2,x[i]);p.addBatch();}p.executeBatch();
        }
    }
    private static void seedEvents(Connection c) throws Exception {
        if(!empty(c,"events")) return;
        String[][] a={{"Annual Technical Fest","Technical","Coding competitions, project exhibitions and technology challenges.","2026-12-05","9:30 AM – 4:00 PM","Main Auditorium","Upcoming"},{"Research and Innovation Seminar","Academic","Research methods, innovation and emerging technology.","2026-12-08","10:00 AM – 1:00 PM","Seminar Hall","Upcoming"},{"Campus Cultural Celebration","Cultural","A celebration of creativity, music, dance and student talent.","2026-12-12","11:00 AM – 5:00 PM","Open Auditorium","Upcoming"},{"Interdepartment Sports Meet","Sports","Team games and individual sports competitions.","2026-12-15","8:30 AM – 3:00 PM","College Ground","Upcoming"},{"Artificial Intelligence Workshop","Technical","An interactive workshop on practical AI concepts.","2026-12-18","10:00 AM – 2:00 PM","Computer Lab","Upcoming"},{"Faculty Development Program","Academic","A professional development session for faculty.","2026-11-20","10:00 AM – 1:00 PM","Conference Room","Completed"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO events(title,category,description,event_date,event_time,venue,status) VALUES(?,?,?,?,?,?,?)")){
            for(String[] x:a){for(int i=0;i<7;i++)p.setString(i+1,x[i]);p.addBatch();}p.executeBatch();
        }
    }
    private static void seedAnnouncements(Connection c) throws Exception {
        if(!empty(c,"announcements")) return;
        String[][] a={{"Internal Assessment Schedule Released","Academic","Important","The internal assessment schedule for all departments has been published.","Academic Office","2026-11-28"},{"Examination Registration Reminder","Examination","Important","Students must complete their examination registration within the announced deadline.","Examination Cell","2026-11-27"},{"Annual Technical Fest – Registrations Open","Events","New Update","Faculty members are invited to encourage students to participate.","Event Coordination Team","2026-11-26"},{"Faculty Meeting Notification","Academic","Normal","A departmental faculty meeting has been scheduled.","Department Office","2026-11-25"},{"Library Working Hours Update","General","Normal","The central library has updated its working hours.","Library Administration","2026-11-24"},{"Workshop on Emerging Technologies","Events","Normal","A technical workshop covering emerging technologies will be conducted.","Training and Development Cell","2026-11-22"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO announcements(title,category,priority,body,posted_by,posted_date) VALUES(?,?,?,?,?,?)")){
            for(String[] x:a){for(int i=0;i<6;i++)p.setString(i+1,x[i]);p.addBatch();}p.executeBatch();
        }
    }
    private static void seedLeaves(Connection c,String f) throws Exception {
        if(!empty(c,"leaves")) return;
        String[][] a={{"Casual Leave","2026-10-12","2026-10-13","Personal work","Approved"},{"Medical Leave","2026-10-22","2026-10-22","Medical appointment","Approved"},{"Personal Leave","2026-12-02","2026-12-03","Family commitment","Pending"}};
        try(PreparedStatement p=c.prepareStatement("INSERT INTO leaves(faculty_id,leave_type,start_date,end_date,reason,status) VALUES(?,?,?,?,?,?)")){
            for(String[] x:a){p.setString(1,f);for(int i=0;i<5;i++)p.setString(i+2,x[i]);p.addBatch();}p.executeBatch();
        }
    }
}
