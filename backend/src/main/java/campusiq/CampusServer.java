
package campusiq;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class CampusServer {

    private static final Map<String, Integer> sessions =
            new ConcurrentHashMap<>();

    private static final AdministratorDAO dao =
            new AdministratorDAO();

    private static String cookieName = "CAMPUSIQ_SESSION";

    public static void main(String[] args) throws IOException {

        HttpServer server = HttpServer.create(
                new InetSocketAddress("127.0.0.1", 8080), 0);

        server.createContext("/api/login", CampusServer::login);
        server.createContext("/api/profile", CampusServer::profile);
        server.createContext("/api/logout", CampusServer::logout);
        server.createContext("/", CampusServer::serveFrontend);

        server.setExecutor(null);
        server.start();

        System.out.println("CampusIQ server started!");
        System.out.println("Open http://127.0.0.1:8080/login.html");
    }

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
            cookieName + "=" + token + "; Path=/; HttpOnly; SameSite=Lax"
        );

        send(exchange, 200, "Login successful");
    }

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

            if (parts.length == 2 &&
                parts[0].equals(cookieName)) {
                return parts[1];
            }
        }

        return null;
    }

    private static Map<String, String> readForm(
            HttpExchange exchange) throws IOException {

        String body = new String(
            exchange.getRequestBody().readAllBytes(),
            StandardCharsets.UTF_8
        );

        Map<String, String> data = new HashMap<>();

        for (String pair : body.split("&")) {

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

    private static String escape(String value) {

        if (value == null) {
            return "";
        }

        return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r");
    }

    private static void send(
            HttpExchange exchange, int status, String message)
            throws IOException {

        byte[] response = message.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
            "Content-Type", "text/plain; charset=UTF-8"
        );

        exchange.sendResponseHeaders(status, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    private static void sendJson(
            HttpExchange exchange, int status, String json)
            throws IOException {

        byte[] response = json.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
            "Content-Type", "application/json; charset=UTF-8"
        );

        exchange.sendResponseHeaders(status, response.length);
        exchange.getResponseBody().write(response);
        exchange.close();
    }

    private static void serveFrontend(HttpExchange exchange)
            throws IOException {

        if (!exchange.getRequestMethod().equals("GET")) {
            send(exchange, 405, "Method not allowed");
            return;
        }

        String requestPath =
            URLDecoder.decode(
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
        } else if (requestPath.endsWith(".jpg") ||
                   requestPath.endsWith(".jpeg")) {
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
