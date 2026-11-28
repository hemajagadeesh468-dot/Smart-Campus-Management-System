package campusiq.faculty;

import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.*;
import java.util.*;
import java.util.concurrent.*;

public class CampusServer {
    private static final Map<String,String> SESSIONS = new ConcurrentHashMap<>();
    private static final Map<String,String> TABLES = Map.of(
        "courses","courses","attendance","attendance","assignments","assignments",
        "grades","grades","timetable","timetable","events","events",
        "announcements","announcements","leaves","leaves"
    );
    private static final Map<String,Map<String,String>> FIELDS = new HashMap<>();
    static {
        FIELDS.put("courses", map("code","code","title","title","department","department","semester","semester","credits","credits","students","students","description","description"));
        FIELDS.put("attendance", map("studentId","student_id","studentName","student_name","course","course","date","attendance_date","status","status"));
        FIELDS.put("assignments", map("title","title","course","course","description","description","dueDate","due_date","maximumMarks","maximum_marks","status","status","submissions","submissions","totalStudents","total_students"));
        FIELDS.put("grades", map("studentId","student_id","studentName","student_name","course","course","marks","marks","totalMarks","total_marks"));
        FIELDS.put("timetable", map("day","day","startTime","start_time","endTime","end_time","course","course","courseCode","course_code","classroom","classroom","section","section","type","session_type"));
        FIELDS.put("events", map("title","title","category","category","description","description","eventDate","event_date","eventTime","event_time","venue","venue","status","status"));
        FIELDS.put("announcements", map("title","title","category","category","priority","priority","body","body","postedBy","posted_by","postedDate","posted_date"));
        FIELDS.put("leaves", map("leaveType","leave_type","startDate","start_date","endDate","end_date","reason","reason","status","status"));
    }
    private static Map<String,String> map(String... a){Map<String,String>m=new LinkedHashMap<>();for(int i=0;i<a.length;i+=2)m.put(a[i],a[i+1]);return m;}

    public static void main(String[] args) throws Exception {
        DatabaseInitializer.initialize();
        int port = args.length>0 ? Integer.parseInt(args[0]) : 8081;
        HttpServer server=HttpServer.create(new InetSocketAddress("0.0.0.0",port),0);
        server.createContext("/health",e->send(e,200,Map.of("status","ok","service","CampusIQ Faculty Backend")));
        server.createContext("/api/",CampusServer::handle);
        server.setExecutor(Executors.newFixedThreadPool(10));
        server.start();
        System.out.println("CampusIQ Faculty Backend running at http://localhost:"+port);
        System.out.println("Demo login: faculty@campusiq.edu / Faculty@123");
    }

    private static void handle(HttpExchange e) throws IOException {
        cors(e);
        if("OPTIONS".equalsIgnoreCase(e.getRequestMethod())){e.sendResponseHeaders(204,-1);return;}
        try {
            String path=e.getRequestURI().getPath().substring("/api/".length());
            String method=e.getRequestMethod().toUpperCase(Locale.ROOT);
            Map<String,Object> body=readBody(e);
            if(path.equals("login")&&method.equals("POST")){login(e,body);return;}
            if(path.equals("logout")&&method.equals("POST")){String t=token(e);SESSIONS.remove(t);send(e,200,Map.of("message","Logged out"));return;}
            String faculty=authenticate(e);
            if(faculty==null){send(e,401,Map.of("error","Authentication required"));return;}
            if(path.equals("profile")){profile(e,method,body,faculty);return;}
            if(path.equals("dashboard")&&method.equals("GET")){dashboard(e,faculty);return;}
            if(path.equals("reports/attendance")&&method.equals("GET")){attendanceReport(e,faculty);return;}
            String collectionPath=path;
            if(path.contains("/")) collectionPath=path.substring(0,path.indexOf('/'));
            if(TABLES.containsKey(collectionPath)){collection(e,collectionPath,method,body,faculty);return;}
            send(e,404,Map.of("error","Endpoint not found","path",path));
        } catch(Exception ex){ex.printStackTrace();send(e,500,Map.of("error","Server error","details",String.valueOf(ex.getMessage())));}
    }
    private static void login(HttpExchange e,Map<String,Object>b)throws Exception{
        String email=str(b,"email"),password=str(b,"password");
        if(email.isBlank()||password.isBlank()){send(e,400,Map.of("error","Email and password are required"));return;}
        try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement("SELECT faculty_id,full_name,email,password_hash,designation,department FROM faculty WHERE email=? COLLATE NOCASE AND active=1")){
            p.setString(1,email);try(ResultSet r=p.executeQuery()){
                if(!r.next()||!hash(password).equals(r.getString("password_hash"))){send(e,401,Map.of("error","Invalid email or password"));return;}
                String token=UUID.randomUUID().toString();SESSIONS.put(token,r.getString("faculty_id"));
                send(e,200,Map.of("token",token,"faculty",Map.of("facultyId",r.getString("faculty_id"),"name",r.getString("full_name"),"email",r.getString("email"),"designation",r.getString("designation"),"department",r.getString("department"))));
            }
        }
    }
    private static void profile(HttpExchange e,String method,Map<String,Object>b,String fid)throws Exception{
        if(method.equals("GET")){
            try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement("SELECT faculty_id AS facultyId,full_name AS fullName,email,phone,date_of_birth AS dateOfBirth,gender,address,designation,department,qualification,experience,joining_date AS joiningDate FROM faculty WHERE faculty_id=?")){
                p.setString(1,fid);try(ResultSet r=p.executeQuery()){if(r.next())send(e,200,row(r));else send(e,404,Map.of("error","Profile not found"));}
            }return;
        }
        if(method.equals("PUT")||method.equals("PATCH")){
            Map<String,String> allowed=Map.of("fullName","full_name","email","email","phone","phone","dateOfBirth","date_of_birth","gender","gender","address","address","designation","designation","department","department","qualification","qualification","experience","experience");
            List<String> cols=new ArrayList<>();List<Object> vals=new ArrayList<>();
            for(var x:allowed.entrySet())if(b.containsKey(x.getKey())){cols.add(x.getValue()+"=?");vals.add(b.get(x.getKey()));}
            if(cols.isEmpty()){send(e,400,Map.of("error","No profile fields supplied"));return;}
            vals.add(fid);try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement("UPDATE faculty SET "+String.join(",",cols)+" WHERE faculty_id=?")){
                for(int i=0;i<vals.size();i++)p.setObject(i+1,vals.get(i));p.executeUpdate();
            }send(e,200,Map.of("message","Profile updated"));return;
        }
        send(e,405,Map.of("error","Method not allowed"));
    }
    private static void collection(HttpExchange e,String path,String method,Map<String,Object>b,String fid)throws Exception{
        String table=TABLES.get(path);boolean global=path.equals("events")||path.equals("announcements");
        if(method.equals("GET")){
            String sql="SELECT * FROM "+table+(global?"":" WHERE faculty_id=?")+" ORDER BY id";
            try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement(sql)){
                if(!global)p.setString(1,fid);try(ResultSet r=p.executeQuery()){List<Map<String,Object>> rows=new ArrayList<>();while(r.next())rows.add(row(r));send(e,200,rows);}
            }return;
        }
        if(method.equals("POST")){
            Map<String,String> fields=FIELDS.get(path);List<String> cols=new ArrayList<>();List<Object> vals=new ArrayList<>();
            if(!global){cols.add("faculty_id");vals.add(fid);}
            for(var x:fields.entrySet())if(b.containsKey(x.getKey())){cols.add(x.getValue());vals.add(b.get(x.getKey()));}
            if(cols.isEmpty()){send(e,400,Map.of("error","No fields supplied"));return;}
            String marks=String.join(",",Collections.nCopies(cols.size(),"?"));
            try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement("INSERT INTO "+table+"("+String.join(",",cols)+") VALUES("+marks+")",Statement.RETURN_GENERATED_KEYS)){
                for(int i=0;i<vals.size();i++)p.setObject(i+1,vals.get(i));p.executeUpdate();
                long id=-1;try(ResultSet r=p.getGeneratedKeys()){if(r.next())id=r.getLong(1);}send(e,201,Map.of("message","Record created","id",id));
            }return;
        }
        long id;try{id=Long.parseLong(e.getRequestURI().getPath().substring(e.getRequestURI().getPath().lastIndexOf('/')+1));}catch(Exception ex){send(e,400,Map.of("error","Use /api/"+path+"/{id} for update or delete"));return;}
        if(method.equals("DELETE")){
            String sql="DELETE FROM "+table+" WHERE id=?"+(global?"":" AND faculty_id=?");
            try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement(sql)){p.setLong(1,id);if(!global)p.setString(2,fid);int n=p.executeUpdate();send(e,n>0?200:404,Map.of("message",n>0?"Record deleted":"Record not found"));}return;
        }
        if(method.equals("PUT")||method.equals("PATCH")){
            Map<String,String> fields=FIELDS.get(path);List<String> sets=new ArrayList<>();List<Object> vals=new ArrayList<>();
            for(var x:fields.entrySet())if(b.containsKey(x.getKey())){sets.add(x.getValue()+"=?");vals.add(b.get(x.getKey()));}
            if(sets.isEmpty()){send(e,400,Map.of("error","No fields supplied"));return;}
            String sql="UPDATE "+table+" SET "+String.join(",",sets)+" WHERE id=?"+(global?"":" AND faculty_id=?");
            try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement(sql)){int i=1;for(Object v:vals)p.setObject(i++,v);p.setLong(i++,id);if(!global)p.setString(i,fid);int n=p.executeUpdate();send(e,n>0?200:404,Map.of("message",n>0?"Record updated":"Record not found"));}return;
        }
        send(e,405,Map.of("error","Method not allowed"));
    }
    private static void dashboard(HttpExchange e,String fid)throws Exception{
        try(Connection c=DatabaseConnection.getConnection()){
            int courses=count(c,"courses",fid),assignments=count(c,"assignments",fid);
            int students=scalar(c,"SELECT COALESCE(SUM(students),0) FROM courses WHERE faculty_id=?",fid);
            int pending=scalar(c,"SELECT COALESCE(SUM(MAX(total_students-submissions,0)),0) FROM assignments WHERE faculty_id=? AND status='Active'",fid);
            Map<String,Integer> attendance=new LinkedHashMap<>();
            try(PreparedStatement p=c.prepareStatement("SELECT status,COUNT(*) n FROM attendance WHERE faculty_id=? GROUP BY status")){p.setString(1,fid);try(ResultSet r=p.executeQuery()){while(r.next())attendance.put(r.getString(1),r.getInt(2));}}
            send(e,200,Map.of("courses",courses,"students",students,"assignments",assignments,"pendingReviews",pending,"attendance",attendance));
        }
    }
    private static void attendanceReport(HttpExchange e,String fid)throws Exception{
        try(Connection c=DatabaseConnection.getConnection();PreparedStatement p=c.prepareStatement("SELECT COUNT(*) total,SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) present,SUM(CASE WHEN status='Absent' THEN 1 ELSE 0 END) absent,SUM(CASE WHEN status='Late' THEN 1 ELSE 0 END) late FROM attendance WHERE faculty_id=?")){
            p.setString(1,fid);try(ResultSet r=p.executeQuery()){r.next();int total=r.getInt("total"),present=r.getInt("present");send(e,200,Map.of("total",total,"present",present,"absent",r.getInt("absent"),"late",r.getInt("late"),"percentage",total==0?0:Math.round(present*1000.0/total)/10.0));}
        }
    }
    private static int count(Connection c,String t,String fid)throws Exception{return scalar(c,"SELECT COUNT(*) FROM "+t+" WHERE faculty_id=?",fid);}
    private static int scalar(Connection c,String sql,String fid)throws Exception{try(PreparedStatement p=c.prepareStatement(sql)){p.setString(1,fid);try(ResultSet r=p.executeQuery()){return r.next()?r.getInt(1):0;}}}
    private static Map<String,Object> row(ResultSet r)throws Exception{
        Map<String,Object>m=new LinkedHashMap<>();ResultSetMetaData md=r.getMetaData();
        for(int i=1;i<=md.getColumnCount();i++){String k=md.getColumnLabel(i);Object v=r.getObject(i);m.put(k,v);}return m;
    }
    private static Map<String,Object> readBody(HttpExchange e)throws IOException{
        String s=new String(e.getRequestBody().readAllBytes(),StandardCharsets.UTF_8);
        Object o=Json.parse(s);return o instanceof Map<?,?>?(Map<String,Object>)o:new LinkedHashMap<>();
    }
    private static String str(Map<String,Object>m,String k){Object v=m.get(k);return v==null?"":String.valueOf(v);}
    private static String token(HttpExchange e){String h=e.getRequestHeaders().getFirst("Authorization");return h!=null&&h.startsWith("Bearer ")?h.substring(7):"";}
    private static String authenticate(HttpExchange e){return SESSIONS.get(token(e));}
    private static String hash(String s)throws Exception{byte[]b=MessageDigest.getInstance("SHA-256").digest(s.getBytes(StandardCharsets.UTF_8));StringBuilder x=new StringBuilder();for(byte v:b)x.append(String.format("%02x",v));return x.toString();}
    private static void cors(HttpExchange e){Headers h=e.getResponseHeaders();h.set("Access-Control-Allow-Origin","*");h.set("Access-Control-Allow-Headers","Content-Type, Authorization");h.set("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE, OPTIONS");h.set("Content-Type","application/json; charset=utf-8");}
    private static void send(HttpExchange e,int status,Object value)throws IOException{byte[]b=Json.stringify(value).getBytes(StandardCharsets.UTF_8);e.sendResponseHeaders(status,b.length);try(OutputStream o=e.getResponseBody()){o.write(b);}}
}
