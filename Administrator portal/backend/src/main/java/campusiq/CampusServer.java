
package campusiq;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class CampusServer {

    private static final Map<String, Integer> sessions =
            new ConcurrentHashMap<>();

    private static final AdministratorDAO dao =
            new AdministratorDAO();

    private static final String cookieName = "CAMPUSIQ_SESSION";

    public static void main(String[] args) throws IOException {

        DatabaseInitializer.initialize();

        HttpServer server = HttpServer.create(
                new InetSocketAddress("127.0.0.1", 8080), 0);

        server.createContext("/api/login", CampusServer::login);
        server.createContext("/api/profile", CampusServer::profile);
        server.createContext("/api/logout", CampusServer::logout);
        server.createContext("/api/activities", CampusServer::activities);
        server.createContext("/api/bookings", CampusServer::bookings);

        server.createContext("/", CampusServer::serveFrontend);

        server.setExecutor(null);
        server.start();

        System.out.println("CampusIQ server started!");
        System.out.println("Open http://127.0.0.1:8080/login.html");
    }

    // ==================================================
    // ACTIVITIES API
    // ==================================================

    private static void activities(HttpExchange exchange)
            throws IOException {

        Integer adminId = getSession(exchange);

        if (adminId == null) {
            sendJson(exchange, 401,
                    "{\"message\":\"Please log in\"}");
            return;
        }

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        ActivityDAO activityDAO = new ActivityDAO();

        if (method.equals("GET")) {

            List<CampusActivity> activities =
                    activityDAO.getAllActivities();

            StringBuilder json = new StringBuilder("[");

            for (int i = 0; i < activities.size(); i++) {

                CampusActivity activity = activities.get(i);

                if (i > 0) {
                    json.append(",");
                }

                json.append("{")
                    .append("\"id\":").append(activity.getId()).append(",")
                    .append("\"name\":\"").append(escape(activity.getActivityName())).append("\",")
                    .append("\"type\":\"").append(escape(activity.getActivityType())).append("\",")
                    .append("\"description\":\"").append(escape(activity.getDescription())).append("\",")
                    .append("\"date\":\"").append(escape(activity.getActivityDate())).append("\",")
                    .append("\"time\":\"").append(escape(activity.getActivityTime())).append("\",")
                    .append("\"venue\":\"").append(escape(activity.getLocation())).append("\",")
                    .append("\"location\":\"").append(escape(activity.getLocation())).append("\",")
                    .append("\"organizer\":\"").append(escape(activity.getOrganizer())).append("\",")
                    .append("\"capacity\":").append(activity.getCapacity())
                    .append("}");
            }

            json.append("]");

            sendJson(exchange, 200, json.toString());
            return;
        }

        int activityId = getPathId(path, "/api/activities/");

        if (path.contains("/api/activities/") && activityId <= 0) {
            sendJson(exchange, 400,
                    "{\"message\":\"Invalid activity ID\"}");
            return;
        }

        if (method.equals("POST")) {

            Map<String, String> data = readData(exchange);

            String name = data.getOrDefault("name", "").trim();
            String type = data.getOrDefault("type", "").trim();
            String description = data.getOrDefault("description", "").trim();
            String date = data.getOrDefault("date", "").trim();
            String time = data.getOrDefault("time", "").trim();

            String venue = data.getOrDefault(
                    "venue", data.getOrDefault("location", "")).trim();

            String organizer = data.getOrDefault("organizer", "").trim();

            int capacity;

            try {
                capacity = Integer.parseInt(
                        data.getOrDefault("capacity", "0"));
            } catch (NumberFormatException e) {
                sendJson(exchange, 400,
                        "{\"message\":\"Capacity must be a number\"}");
                return;
            }

            if (name.isEmpty() || date.isEmpty() || capacity < 0) {
                sendJson(exchange, 400,
                        "{\"message\":\"Enter valid activity details\"}");
                return;
            }

            CampusActivity activity = new CampusActivity(
                    name, type, description, date,
                    time, venue, organizer, capacity
            );

            boolean added = activityDAO.addActivity(activity);

            sendJson(exchange, added ? 201 : 500,
                    added
                    ? "{\"message\":\"Activity added successfully\"}"
                    : "{\"message\":\"Could not add activity\"}");

            return;
        }

        if (method.equals("PUT")) {

            if (activityId <= 0) {
                sendJson(exchange, 400,
                        "{\"message\":\"Activity ID is required\"}");
                return;
            }

            Map<String, String> data = readData(exchange);

            String name = data.getOrDefault("name", "").trim();
            String type = data.getOrDefault("type", "").trim();
            String description = data.getOrDefault("description", "").trim();
            String date = data.getOrDefault("date", "").trim();
            String time = data.getOrDefault("time", "").trim();

            String venue = data.getOrDefault(
                    "venue", data.getOrDefault("location", "")).trim();

            String organizer = data.getOrDefault("organizer", "").trim();

            int capacity;

            try {
                capacity = Integer.parseInt(
                        data.getOrDefault("capacity", "0"));
            } catch (NumberFormatException e) {
                sendJson(exchange, 400,
                        "{\"message\":\"Invalid capacity\"}");
                return;
            }

            if (name.isEmpty() || date.isEmpty() || capacity < 0) {
                sendJson(exchange, 400,
                        "{\"message\":\"Enter valid activity details\"}");
                return;
            }

            CampusActivity activity = new CampusActivity(
                    activityId, name, type, description,
                    date, time, venue, organizer, capacity
            );

            boolean updated = activityDAO.updateActivity(activity);

            sendJson(exchange, updated ? 200 : 404,
                    updated
                    ? "{\"message\":\"Activity updated successfully\"}"
                    : "{\"message\":\"Activity not found\"}");

            return;
        }

        if (method.equals("DELETE")) {

            if (activityId <= 0) {
                sendJson(exchange, 400,
                        "{\"message\":\"Activity ID is required\"}");
                return;
            }

            boolean deleted =
                    activityDAO.deleteActivityById(activityId);

            sendJson(exchange, deleted ? 200 : 404,
                    deleted
                    ? "{\"message\":\"Activity deleted successfully\"}"
                    : "{\"message\":\"Activity not found\"}");

            return;
        }

        sendJson(exchange, 405,
                "{\"message\":\"Method not allowed\"}");
    }

    // ==================================================
    // BOOKINGS API
    // ==================================================

    private static void bookings(HttpExchange exchange)
            throws IOException {

        Integer adminId = getSession(exchange);

        if (adminId == null) {
            sendJson(exchange, 401,
                    "{\"message\":\"Please log in\"}");
            return;
        }

        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        int bookingId = getPathId(path, "/api/bookings/");

        if (path.startsWith("/api/bookings/") && bookingId <= 0) {
            sendJson(exchange, 400,
                    "{\"message\":\"Invalid booking ID\"}");
            return;
        }

        // GET: Retrieve all bookings
        if (method.equals("GET")) {

            String sql = """
                SELECT b.id,
                       s.name AS person,
                       r.resource_name AS resource,
                       b.booking_date,
                       b.start_time,
                       b.end_time,
                       b.status
                FROM bookings b
                JOIN students s ON b.student_id = s.id
                JOIN resources r ON b.resource_id = r.id
                ORDER BY b.id ASC
                """;

            StringBuilder json = new StringBuilder("[");

            try (Connection con = DatabaseConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {

                boolean first = true;

                while (rs.next()) {

                    if (!first) {
                        json.append(",");
                    }

                    first = false;

                    int id = rs.getInt("id");

                    json.append("{")
                        .append("\"id\":\"BK")
                        .append(String.format("%05d", id))
                        .append("\",")
                        .append("\"person\":\"")
                        .append(escape(rs.getString("person")))
                        .append("\",")
                        .append("\"resource\":\"")
                        .append(escape(rs.getString("resource")))
                        .append("\",")
                        .append("\"date\":\"")
                        .append(escape(rs.getString("booking_date")))
                        .append("\",")
                        .append("\"startTime\":\"")
                        .append(escape(rs.getString("start_time")))
                        .append("\",")
                        .append("\"endTime\":\"")
                        .append(escape(rs.getString("end_time")))
                        .append("\",")
                        .append("\"status\":\"")
                        .append(escape(rs.getString("status")))
                        .append("\"")
                        .append("}");
                }

                json.append("]");

                sendJson(exchange, 200, json.toString());

            } catch (SQLException e) {
                e.printStackTrace();

                sendJson(exchange, 500,
                        "{\"message\":\"Could not retrieve bookings\"}");
            }

            return;
        }

        // POST: Add a new booking
        if (method.equals("POST")) {

            Map<String, String> data = readData(exchange);

            String person = data.getOrDefault("person", "").trim();
            String resource = data.getOrDefault("resource", "").trim();
            String date = data.getOrDefault("date", "").trim();
            String startTime = data.getOrDefault("startTime", "").trim();
            String endTime = data.getOrDefault("endTime", "").trim();
            String status = data.getOrDefault("status", "Pending").trim();

            if (!validBooking(person, resource, date,
                    startTime, endTime, status)) {

                sendJson(exchange, 400,
                        "{\"message\":\"Enter valid booking details\"}");
                return;
            }

            try (Connection con = DatabaseConnection.getConnection()) {

                Integer studentId = findStudentId(con, person);
                Integer resourceId = findResourceId(con, resource);

                if (studentId == null) {
                    sendJson(exchange, 400,
                            "{\"message\":\"Student not found\"}");
                    return;
                }

                if (resourceId == null) {
                    sendJson(exchange, 400,
                            "{\"message\":\"Resource not found\"}");
                    return;
                }

                if (hasBookingConflict(con, resourceId, date,
                        startTime, endTime, -1)) {

                    sendJson(exchange, 409,
                            "{\"message\":\"This resource is already booked during that time\"}");
                    return;
                }

                String sql = """
                    INSERT INTO bookings
                    (student_id, resource_id, booking_date,
                     start_time, end_time, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """;

                try (PreparedStatement ps = con.prepareStatement(sql)) {

                    ps.setInt(1, studentId);
                    ps.setInt(2, resourceId);
                    ps.setString(3, date);
                    ps.setString(4, startTime);
                    ps.setString(5, endTime);
                    ps.setString(6, status);

                    ps.executeUpdate();
                }

                sendJson(exchange, 201,
                        "{\"message\":\"Booking added successfully\"}");

            } catch (SQLException e) {
                e.printStackTrace();

                sendJson(exchange, 500,
                        "{\"message\":\"Could not add booking\"}");
            }

            return;
        }

        // PUT: Update booking details or status
        if (method.equals("PUT")) {

            if (bookingId <= 0) {
                sendJson(exchange, 400,
                        "{\"message\":\"Booking ID is required\"}");
                return;
            }

            Map<String, String> data = readData(exchange);

            String person = data.getOrDefault("person", "").trim();
            String resource = data.getOrDefault("resource", "").trim();
            String date = data.getOrDefault("date", "").trim();
            String startTime = data.getOrDefault("startTime", "").trim();
            String endTime = data.getOrDefault("endTime", "").trim();
            String status = data.getOrDefault("status", "").trim();

            if (!validBooking(person, resource, date,
                    startTime, endTime, status)) {

                sendJson(exchange, 400,
                        "{\"message\":\"Enter valid booking details\"}");
                return;
            }

            try (Connection con = DatabaseConnection.getConnection()) {

                Integer studentId = findStudentId(con, person);
                Integer resourceId = findResourceId(con, resource);

                if (studentId == null || resourceId == null) {
                    sendJson(exchange, 400,
                            "{\"message\":\"Student or resource not found\"}");
                    return;
                }

                if (hasBookingConflict(con, resourceId, date,
                        startTime, endTime, bookingId)) {

                    sendJson(exchange, 409,
                            "{\"message\":\"This resource is already booked during that time\"}");
                    return;
                }

                String sql = """
                    UPDATE bookings
                    SET student_id = ?,
                        resource_id = ?,
                        booking_date = ?,
                        start_time = ?,
                        end_time = ?,
                        status = ?
                    WHERE id = ?
                    """;

                try (PreparedStatement ps = con.prepareStatement(sql)) {

                    ps.setInt(1, studentId);
                    ps.setInt(2, resourceId);
                    ps.setString(3, date);
                    ps.setString(4, startTime);
                    ps.setString(5, endTime);
                    ps.setString(6, status);
                    ps.setInt(7, bookingId);

                    int rows = ps.executeUpdate();

                    if (rows == 0) {
                        sendJson(exchange, 404,
                                "{\"message\":\"Booking not found\"}");
                        return;
                    }
                }

                sendJson(exchange, 200,
                        "{\"message\":\"Booking updated successfully\"}");

            } catch (SQLException e) {
                e.printStackTrace();

                sendJson(exchange, 500,
                        "{\"message\":\"Could not update booking\"}");
            }

            return;
        }

        // DELETE: Delete a booking
        if (method.equals("DELETE")) {

            if (bookingId <= 0) {
                sendJson(exchange, 400,
                        "{\"message\":\"Booking ID is required\"}");
                return;
            }

            String sql = "DELETE FROM bookings WHERE id = ?";

            try (Connection con = DatabaseConnection.getConnection();
                 PreparedStatement ps = con.prepareStatement(sql)) {

                ps.setInt(1, bookingId);

                int rows = ps.executeUpdate();

                if (rows > 0) {
                    sendJson(exchange, 200,
                            "{\"message\":\"Booking deleted successfully\"}");
                } else {
                    sendJson(exchange, 404,
                            "{\"message\":\"Booking not found\"}");
                }

            } catch (SQLException e) {
                e.printStackTrace();

                sendJson(exchange, 500,
                        "{\"message\":\"Could not delete booking\"}");
            }

            return;
        }

        sendJson(exchange, 405,
                "{\"message\":\"Method not allowed\"}");
    }

    // ==================================================
    // BOOKING HELPER METHODS
    // ==================================================

    private static Integer findStudentId(
            Connection con, String name) throws SQLException {

        String sql = """
            SELECT id FROM students
            WHERE LOWER(name) = LOWER(?)
            LIMIT 1
            """;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }

        return null;
    }

    private static Integer findResourceId(
            Connection con, String name) throws SQLException {

        String sql = """
            SELECT id FROM resources
            WHERE LOWER(resource_name) = LOWER(?)
            LIMIT 1
            """;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id");
                }
            }
        }

        return null;
    }

    private static boolean hasBookingConflict(
            Connection con,
            int resourceId,
            String date,
            String startTime,
            String endTime,
            int excludeId) throws SQLException {

        String sql = """
            SELECT COUNT(*) FROM bookings
            WHERE resource_id = ?
              AND booking_date = ?
              AND status NOT IN ('Rejected', 'Cancelled')
              AND id <> ?
              AND start_time < ?
              AND end_time > ?
            """;

        try (PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, resourceId);
            ps.setString(2, date);
            ps.setInt(3, excludeId);
            ps.setString(4, endTime);
            ps.setString(5, startTime);

            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        }
    }

    private static boolean validBooking(
            String person,
            String resource,
            String date,
            String startTime,
            String endTime,
            String status) {

        if (person.isEmpty() || resource.isEmpty()
                || date.isEmpty() || startTime.isEmpty()
                || endTime.isEmpty()) {
            return false;
        }

        if (!Arrays.asList(
                "Pending", "Approved", "Rejected", "Cancelled"
        ).contains(status)) {
            return false;
        }

        return startTime.matches("\\d{2}:\\d{2}")
                && endTime.matches("\\d{2}:\\d{2}")
                && endTime.compareTo(startTime) > 0;
    }

    // ==================================================
    // LOGIN
    // ==================================================

    private static void login(HttpExchange exchange) throws IOException {

        if (!exchange.getRequestMethod().equals("POST")) {
            send(exchange, 405, "Method not allowed");
            return;
        }

        Map<String, String> data = readForm(exchange);

        String email = data.getOrDefault("email", "").trim();
        String password = data.getOrDefault("password", "");

        Administrator admin = dao.login(email, password);

        if (admin == null) {
            send(exchange, 401, "Invalid email or password");
            return;
        }

        String token = UUID.randomUUID().toString();

        sessions.put(token, admin.getId());

        exchange.getResponseHeaders().add(
                "Set-Cookie",
                cookieName + "=" + token
                        + "; Path=/; HttpOnly; SameSite=Lax"
        );

        send(exchange, 200, "Login successful");
    }

    // ==================================================
    // PROFILE
    // ==================================================

    private static void profile(HttpExchange exchange)
            throws IOException {

        Integer adminId = getSession(exchange);

        if (adminId == null) {
            send(exchange, 401, "Please log in");
            return;
        }

        if (exchange.getRequestMethod().equals("GET")) {

            Administrator admin = dao.getAdministrator(adminId);

            if (admin == null) {
                send(exchange, 404, "Administrator not found");
                return;
            }

            String json = "{"
                    + "\"id\":" + admin.getId() + ","
                    + "\"name\":\"" + escape(admin.getName()) + "\","
                    + "\"email\":\"" + escape(admin.getEmail()) + "\","
                    + "\"designation\":\"" + escape(admin.getDesignation()) + "\","
                    + "\"department\":\"" + escape(admin.getDepartment()) + "\","
                    + "\"phone\":\"" + escape(admin.getPhone()) + "\""
                    + "}";

            sendJson(exchange, 200, json);
            return;
        }

        if (exchange.getRequestMethod().equals("POST")) {

            Map<String, String> data = readForm(exchange);

            boolean updated = dao.updateProfile(
                    adminId,
                    data.getOrDefault("name", "").trim(),
                    data.getOrDefault("email", "").trim(),
                    data.getOrDefault("designation", "").trim(),
                    data.getOrDefault("department", "").trim(),
                    data.getOrDefault("phone", "").trim()
            );

            if (updated) {
                send(exchange, 200, "Profile updated successfully");
            } else {
                send(exchange, 400, "Profile update failed");
            }

            return;
        }

        send(exchange, 405, "Method not allowed");
    }

    // ==================================================
    // LOGOUT
    // ==================================================

    private static void logout(HttpExchange exchange)
            throws IOException {

        if (!exchange.getRequestMethod().equals("POST")) {
            send(exchange, 405, "Method not allowed");
            return;
        }

        String token = getCookie(exchange);

        if (token != null) {
            sessions.remove(token);
        }

        exchange.getResponseHeaders().add(
                "Set-Cookie",
                cookieName + "=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
        );

        send(exchange, 200, "Logged out successfully");
    }

    // ==================================================
    // SESSION HELPERS
    // ==================================================

    private static Integer getSession(HttpExchange exchange) {

        String token = getCookie(exchange);

        if (token == null) {
            return null;
        }

        return sessions.get(token);
    }

    private static String getCookie(HttpExchange exchange) {

        String cookieHeader =
                exchange.getRequestHeaders().getFirst("Cookie");

        if (cookieHeader == null) {
            return null;
        }

        for (String cookie : cookieHeader.split(";")) {

            String[] parts = cookie.trim().split("=", 2);

            if (parts.length == 2 && parts[0].equals(cookieName)) {
                return parts[1];
            }
        }

        return null;
    }

    // ==================================================
    // REQUEST DATA HELPERS
    // ==================================================

    private static Map<String, String> readForm(
            HttpExchange exchange) throws IOException {

        return readData(exchange);
    }

    private static Map<String, String> readData(
            HttpExchange exchange) throws IOException {

        String body = new String(
                exchange.getRequestBody().readAllBytes(),
                StandardCharsets.UTF_8
        );

        Map<String, String> data = new HashMap<>();

        for (String pair : body.split("&")) {

            if (pair.isEmpty()) {
                continue;
            }

            String[] parts = pair.split("=", 2);

            String key = URLDecoder.decode(
                    parts[0], StandardCharsets.UTF_8
            );

            String value = parts.length > 1
                    ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
                    : "";

            data.put(key, value);
        }

        return data;
    }

    private static int getPathId(String path, String prefix) {

        if (!path.startsWith(prefix)) {
            return -1;
        }

        String value = path.substring(prefix.length());

        try {
            if (value.isEmpty() || value.contains("/")) {
                return -1;
            }

            if (value.startsWith("BK")) {
                value = value.substring(2);
            }

            return Integer.parseInt(value);

        } catch (NumberFormatException e) {
            return -1;
        }
    }

    // ==================================================
    // RESPONSE HELPERS
    // ==================================================

    private static String escape(String value) {

        if (value == null) {
            return "";
        }

        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static void send(
            HttpExchange exchange,
            int status,
            String message) throws IOException {

        byte[] response = message.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
                "Content-Type", "text/plain; charset=UTF-8"
        );

        exchange.sendResponseHeaders(status, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    private static void sendJson(
            HttpExchange exchange,
            int status,
            String json) throws IOException {

        byte[] response = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
        );

        exchange.sendResponseHeaders(status, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    // ==================================================
    // FRONTEND FILE SERVER
    // ==================================================

    private static void serveFrontend(HttpExchange exchange)
            throws IOException {

        if (!exchange.getRequestMethod().equals("GET")) {
            send(exchange, 405, "Method not allowed");
            return;
        }

        String requestPath = URLDecoder.decode(
                exchange.getRequestURI().getPath(),
                StandardCharsets.UTF_8
        );

        if (requestPath.equals("/")) {
            requestPath = "/login.html";
        }

        Path frontend = Path.of("../frontend")
                .toAbsolutePath().normalize();

        Path file = frontend.resolve(requestPath.substring(1))
                .normalize();

        if (!file.startsWith(frontend) || !Files.isRegularFile(file)) {
            send(exchange, 404, "Page not found");
            return;
        }

        String type = "text/html";

        if (requestPath.endsWith(".css")) {
            type = "text/css";
        } else if (requestPath.endsWith(".js")) {
            type = "application/javascript";
        } else if (requestPath.endsWith(".png")) {
            type = "image/png";
        } else if (requestPath.endsWith(".jpg")
                || requestPath.endsWith(".jpeg")) {
            type = "image/jpeg";
        }

        byte[] content = Files.readAllBytes(file);

        exchange.getResponseHeaders().set(
                "Content-Type", type + "; charset=UTF-8"
        );

        exchange.sendResponseHeaders(200, content.length);
        exchange.getResponseBody().write(content);
        exchange.close();
    }
}
