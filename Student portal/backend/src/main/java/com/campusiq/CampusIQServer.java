package com.campusiq;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/** CampusIQ REST backend. Uses JDBC + SQLite and serves the supplied frontend. */
public class CampusIQServer {
 private static final int PORT=Integer.parseInt(System.getenv().getOrDefault("PORT","8080"));
 private static final String DB=System.getenv().getOrDefault("CAMPUSIQ_DB","campusiq.db");
 private static final Path FRONT=Paths.get("../frontend").toAbsolutePath().normalize();
 private static final ObjectMapper JSON=new ObjectMapper();
 private static final Set<String> MODULES=Set.of("assignments","attendance","calendar","events","grievances","library","payments","quizzes","quiz_attempts","results","timetable","notifications","students","faculty","courses","resources","activities","bookings");
 private static final ConcurrentMap<String,Integer> SESSIONS=new ConcurrentHashMap<>();
 private static final BookingService BOOKINGS=new BookingService((resource,slot)->true);

 public static void main(String[] args) throws Exception {
  initializeDatabase();
  HttpServer server=HttpServer.create(new InetSocketAddress(PORT),0);
  server.createContext("/api", CampusIQServer::handleApi);
  server.createContext("/", CampusIQServer::serveFrontend);
  server.setExecutor(Executors.newFixedThreadPool(12));
  System.out.println("CampusIQ Java backend running at http://localhost:"+PORT);
  System.out.println("Demo login: student@gmu.edu / Student@123");
  server.start();
 }
 private static Connection connect() throws SQLException { return DriverManager.getConnection("jdbc:sqlite:"+DB); }
 private static void initializeDatabase() throws Exception {
  Class.forName("org.sqlite.JDBC");
  try(Connection c=connect(); Statement s=c.createStatement()) {
   s.execute("PRAGMA foreign_keys=ON");
   s.execute("CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, department TEXT DEFAULT 'CSE - Data Science', semester TEXT DEFAULT '3', phone TEXT DEFAULT '')");
   s.execute("CREATE TABLE IF NOT EXISTS campus_records(id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER, module TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(owner_id) REFERENCES students(id))");
   s.execute("CREATE INDEX IF NOT EXISTS idx_records_owner_module ON campus_records(owner_id,module)");
   try(PreparedStatement p=c.prepareStatement("SELECT id FROM students WHERE email=?")){p.setString(1,"student@gmu.edu");try(ResultSet r=p.executeQuery()){if(!r.next())try(PreparedStatement ins=c.prepareStatement("INSERT INTO students(student_id,name,email,password_hash) VALUES(?,?,?,?)")){ins.setString(1,"GMU2026001");ins.setString(2,"Demo Student");ins.setString(3,"student@gmu.edu");ins.setString(4,PasswordUtil.hash("Student@123"));ins.executeUpdate();}}}
  }
 }
 private static void handleApi(HttpExchange x) throws IOException {
  try {
   String path=x.getRequestURI().getPath().substring(4); // remove /api
   String method=x.getRequestMethod();
   if(path.equals("/health")){sendJson(x,200,Map.of("status","ok","service","CampusIQ Java JDBC API"));return;}
   if(path.equals("/login")&&method.equals("POST")){login(x);return;}
   if(path.equals("/logout")&&method.equals("POST")){String token=cookie(x,"CAMPUSIQ_SESSION");if(token!=null)SESSIONS.remove(token);send(x,200,"Signed out.","text/plain; charset=utf-8");return;}
   Integer owner=authenticatedOwner(x);
   if(owner==null){sendJson(x,401,Map.of("error","Please sign in first."));return;}
   if(path.equals("/me")&&method.equals("GET")){sendJson(x,200,student(owner));return;}
   if(path.equals("/profile")&&method.equals("PATCH")){Map<String,Object> data=readJson(x);updateProfile(owner,data);sendJson(x,200,student(owner));return;}
   if(path.equals("/dashboard")&&method.equals("GET")){sendJson(x,200,dashboard(owner));return;}
   String[] bits=path.split("/");
   if(bits.length>=2 && bits[1].equals("bookings") && method.equals("POST")) { Map<String,Object> d=readJson(x); Map<String,Object> b=BOOKINGS.book(str(d,"resource"),str(d,"slot"),String.valueOf(owner)); createRecord(owner,"bookings",b); sendJson(x,201,b); return; }
   if(bits.length>=2 && MODULES.contains(bits[1])) { String module=bits[1]; if(bits.length==2){records(x,owner,module,method);return;} if(bits.length==3){record(x,owner,module,bits[2],method);return;} }
   sendJson(x,404,Map.of("error","API route not found."));
  } catch(IllegalArgumentException e){sendJson(x,400,Map.of("error",e.getMessage()));}
    catch(IllegalStateException e){sendJson(x,409,Map.of("error",e.getMessage()));}
    catch(Exception e){e.printStackTrace();sendJson(x,500,Map.of("error","Server error: "+e.getMessage()));}
 }
 private static void login(HttpExchange x) throws Exception {
  String raw=new String(x.getRequestBody().readAllBytes(),StandardCharsets.UTF_8); Map<String,String> form=parseForm(raw);
  String email=form.getOrDefault("email","").trim().toLowerCase(), password=form.getOrDefault("password","");
  try(Connection c=connect();PreparedStatement p=c.prepareStatement("SELECT id,password_hash FROM students WHERE lower(email)=?")){p.setString(1,email);try(ResultSet r=p.executeQuery()){
   if(!r.next()||!PasswordUtil.verify(password,r.getString("password_hash"))){send(x,401,"Invalid student email or password.","text/plain; charset=utf-8");return;}
   String token=UUID.randomUUID().toString();SESSIONS.put(token,r.getInt("id"));x.getResponseHeaders().add("Set-Cookie","CAMPUSIQ_SESSION="+token+"; Path=/; HttpOnly; SameSite=Lax");send(x,200,"Login successful.","text/plain; charset=utf-8");
  }}
 }
 private static void records(HttpExchange x,int owner,String module,String method)throws Exception{
  if(method.equals("GET")){List<Map<String,Object>> rows=listRecords(owner,module); // Collections + Streams used to normalize response
   List<Map<String,Object>> ordered=rows.stream().sorted(Comparator.comparing(m->String.valueOf(m.get("id")))).collect(Collectors.toList());sendJson(x,200,Map.of("items",ordered));return;}
  if(method.equals("POST")){Map<String,Object> data=readJson(x);long id=createRecord(owner,module,data);Map<String,Object> result=new LinkedHashMap<>(data);result.put("id",id);sendJson(x,201,Map.of("message","Saved successfully.","item",result));return;}
  sendJson(x,405,Map.of("error","Method not allowed."));
 }
 private static void record(HttpExchange x,int owner,String module,String idText,String method)throws Exception{
  long id=Long.parseLong(idText);
  if(method.equals("GET")){Map<String,Object> row=getRecord(owner,module,id);if(row==null){sendJson(x,404,Map.of("error","Record not found."));return;}sendJson(x,200,Map.of("item",row));return;}
  if(method.equals("DELETE")){boolean ok=deleteRecord(owner,module,id);sendJson(x,ok?200:404,Map.of("message",ok?"Deleted successfully.":"Record not found."));return;}
  if(method.equals("PUT")||method.equals("PATCH")){Map<String,Object> incoming=readJson(x);Map<String,Object> old=getRecord(owner,module,id);if(old==null){sendJson(x,404,Map.of("error","Record not found."));return;}old.remove("id");if(method.equals("PATCH"))old.putAll(incoming);else old=incoming;updateRecord(owner,module,id,old);old.put("id",id);sendJson(x,200,Map.of("message","Updated successfully.","item",old));return;}
  sendJson(x,405,Map.of("error","Method not allowed."));
 }
 private static long createRecord(int owner,String module,Map<String,Object> data)throws Exception{
  String now=Instant.now().toString();try(Connection c=connect();PreparedStatement p=c.prepareStatement("INSERT INTO campus_records(owner_id,module,data,created_at,updated_at) VALUES(?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS)){p.setInt(1,owner);p.setString(2,module);p.setString(3,JSON.writeValueAsString(data));p.setString(4,now);p.setString(5,now);p.executeUpdate();try(ResultSet r=p.getGeneratedKeys()){if(r.next())return r.getLong(1);}}
  throw new SQLException("Could not create record.");
 }
 private static List<Map<String,Object>> listRecords(int owner,String module)throws Exception{
  List<Map<String,Object>> out=new ArrayList<>();try(Connection c=connect();PreparedStatement p=c.prepareStatement("SELECT id,data,created_at,updated_at FROM campus_records WHERE owner_id=? AND module=? ORDER BY id DESC")){p.setInt(1,owner);p.setString(2,module);try(ResultSet r=p.executeQuery()){while(r.next()){Map<String,Object>d=JSON.readValue(r.getString("data"),new TypeReference<>(){});d.put("id",r.getLong("id"));d.put("createdAt",r.getString("created_at"));d.put("updatedAt",r.getString("updated_at"));out.add(d);}}}return out;
 }
 private static Map<String,Object> getRecord(int owner,String module,long id)throws Exception{try(Connection c=connect();PreparedStatement p=c.prepareStatement("SELECT id,data FROM campus_records WHERE owner_id=? AND module=? AND id=?")){p.setInt(1,owner);p.setString(2,module);p.setLong(3,id);try(ResultSet r=p.executeQuery()){if(!r.next())return null;Map<String,Object>d=JSON.readValue(r.getString("data"),new TypeReference<>(){});d.put("id",r.getLong("id"));return d;}}}
 private static boolean deleteRecord(int owner,String module,long id)throws Exception{try(Connection c=connect();PreparedStatement p=c.prepareStatement("DELETE FROM campus_records WHERE owner_id=? AND module=? AND id=?")){p.setInt(1,owner);p.setString(2,module);p.setLong(3,id);return p.executeUpdate()>0;}}
 private static void updateRecord(int owner,String module,long id,Map<String,Object>d)throws Exception{try(Connection c=connect();PreparedStatement p=c.prepareStatement("UPDATE campus_records SET data=?,updated_at=? WHERE owner_id=? AND module=? AND id=?")){p.setString(1,JSON.writeValueAsString(d));p.setString(2,Instant.now().toString());p.setInt(3,owner);p.setString(4,module);p.setLong(5,id);if(p.executeUpdate()==0)throw new IllegalArgumentException("Record not found.");}}
 private static Map<String,Object> student(int id)throws Exception{try(Connection c=connect();PreparedStatement p=c.prepareStatement("SELECT id,student_id,name,email,department,semester,phone FROM students WHERE id=?")){p.setInt(1,id);try(ResultSet r=p.executeQuery()){if(!r.next())return Map.of();Map<String,Object>m=new LinkedHashMap<>();m.put("id",r.getInt("id"));m.put("studentId",r.getString("student_id"));m.put("name",r.getString("name"));m.put("email",r.getString("email"));m.put("department",r.getString("department"));m.put("semester",r.getString("semester"));m.put("phone",r.getString("phone"));return m;}}}
 private static void updateProfile(int id,Map<String,Object>d)throws Exception{Set<String> allowed=Set.of("name","phone","department","semester");for(String key:d.keySet())if(!allowed.contains(key))throw new IllegalArgumentException("Profile field not allowed: "+key);if(d.containsKey("name")&&String.valueOf(d.get("name")).isBlank())throw new IllegalArgumentException("Name cannot be empty.");try(Connection c=connect()){for(String key:d.keySet())try(PreparedStatement p=c.prepareStatement("UPDATE students SET "+key+"=? WHERE id=?")){p.setString(1,String.valueOf(d.get(key)));p.setInt(2,id);p.executeUpdate();}}}
 private static Map<String,Object> dashboard(int owner)throws Exception{Map<String,Object> counts=new TreeMap<>();try(Connection c=connect();PreparedStatement p=c.prepareStatement("SELECT module,COUNT(*) total FROM campus_records WHERE owner_id=? GROUP BY module")){p.setInt(1,owner);try(ResultSet r=p.executeQuery()){while(r.next())counts.put(r.getString("module"),r.getInt("total"));}}return Map.of("student",student(owner),"counts",counts);}
 private static Integer authenticatedOwner(HttpExchange x){String token=cookie(x,"CAMPUSIQ_SESSION");return token==null?null:SESSIONS.get(token);}
 private static String cookie(HttpExchange x,String name){String c=x.getRequestHeaders().getFirst("Cookie");if(c==null)return null;for(String item:c.split(";")){String[]p=item.trim().split("=",2);if(p.length==2&&p[0].equals(name))return p[1];}return null;}
 private static Map<String,String> parseForm(String raw)throws Exception{Map<String,String>m=new HashMap<>();for(String pair:raw.split("&")){String[]p=pair.split("=",2);if(p.length>0)m.put(URLDecoder.decode(p[0],"UTF-8"),p.length>1?URLDecoder.decode(p[1],"UTF-8"):"");}return m;}
 private static Map<String,Object> readJson(HttpExchange x)throws Exception{Map<String,Object>m=JSON.readValue(x.getRequestBody(),new TypeReference<>(){});if(m==null||m.isEmpty())throw new IllegalArgumentException("JSON request body is required.");return m;}
 private static String str(Map<String,Object>m,String k){return String.valueOf(m.getOrDefault(k,""));}
 private static void serveFrontend(HttpExchange x)throws IOException{String path=x.getRequestURI().getPath();if(path.equals("/"))path="/login.html";Path file=FRONT.resolve(path.substring(1)).normalize();if(!file.startsWith(FRONT)||!Files.isRegularFile(file)){send(x,404,"Frontend file not found. Put the supplied pages in the frontend folder.","text/plain; charset=utf-8");return;}String type=Files.probeContentType(file);if(type==null)type="application/octet-stream";byte[]b=Files.readAllBytes(file);x.getResponseHeaders().set("Content-Type",type);x.sendResponseHeaders(200,b.length);try(OutputStream o=x.getResponseBody()){o.write(b);}}
 private static void sendJson(HttpExchange x,int status,Object body)throws IOException{send(x,status,JSON.writeValueAsString(body),"application/json; charset=utf-8");}
 private static void send(HttpExchange x,int status,String body,String type)throws IOException{byte[]b=body.getBytes(StandardCharsets.UTF_8);x.getResponseHeaders().set("Content-Type",type);x.getResponseHeaders().set("X-Content-Type-Options","nosniff");x.sendResponseHeaders(status,b.length);try(OutputStream o=x.getResponseBody()){o.write(b);}}
}
