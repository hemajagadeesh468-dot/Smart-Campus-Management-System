
package campusiq;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.PreparedStatement;
import java.util.HashSet;
import java.util.Set;

public class DatabaseInitializer {

    public static void initialize() {

        try (Connection connection = DatabaseConnection.getConnection()) {

            if (connection == null) {
                return;
            }

            try (Statement statement = connection.createStatement()) {

                statement.execute("PRAGMA foreign_keys = ON");

                String sql = Files.readString(
                    Path.of("src/main/resources/schema.sql")
                );

                String[] queries = sql.split(";");

                for (String query : queries) {
                    if (!query.trim().isEmpty()) {
                        statement.execute(query);
                    }
                }

                // Check existing activity columns
                Set<String> columns = new HashSet<>();

                try (ResultSet rs = statement.executeQuery(
                    "PRAGMA table_info(campus_activities)"
                )) {
                    while (rs.next()) {
                        columns.add(rs.getString("name"));
                    }
                }

                // Add missing columns
                if (!columns.contains("activity_type")) {
                    statement.execute(
                        "ALTER TABLE campus_activities ADD COLUMN " +
                        "activity_type TEXT NOT NULL DEFAULT ''"
                    );
                }

                // Check existing booking columns
                Set<String> bookingColumns = new HashSet<>();

                try (ResultSet rs = statement.executeQuery(
                    "PRAGMA table_info(bookings)"
                )) {
                    while (rs.next()) {
                        bookingColumns.add(rs.getString("name"));
                    }
                }

                // Add missing start_time column
                if (!bookingColumns.contains("start_time")) {
                    statement.execute(
                        "ALTER TABLE bookings ADD COLUMN start_time TEXT NOT NULL DEFAULT '09:00'"
                    );
                }

                // Add missing end_time column
                if (!bookingColumns.contains("end_time")) {
                    statement.execute(
                        "ALTER TABLE bookings ADD COLUMN end_time TEXT NOT NULL DEFAULT '10:00'"
                    );
                }

                if (!columns.contains("activity_time")) {
                    statement.execute(
                        "ALTER TABLE campus_activities ADD COLUMN " +
                        "activity_time TEXT NOT NULL DEFAULT ''"
                    );
                }

                if (!columns.contains("organizer")) {
                    statement.execute(
                        "ALTER TABLE campus_activities ADD COLUMN " +
                        "organizer TEXT NOT NULL DEFAULT ''"
                    );
                }

                if (!columns.contains("capacity")) {
                    statement.execute(
                        "ALTER TABLE campus_activities ADD COLUMN " +
                        "capacity INTEGER NOT NULL DEFAULT 0"
                    );
                }

                // Insert predefined activities
                String insertSQL =
                    "INSERT INTO campus_activities " +
                    "(activity_name, activity_type, description, " +
                    "activity_date, activity_time, location, organizer, capacity) " +
                    "SELECT ?, ?, ?, ?, ?, ?, ?, ? " +
                    "WHERE NOT EXISTS (" +
                    "SELECT 1 FROM campus_activities " +
                    "WHERE activity_name = ? AND activity_date = ?)";

                try (PreparedStatement ps =
                    connection.prepareStatement(insertSQL)) {

                    String[][] activities = {

                        {
                            "Hackathon 2026", "Technical",
                            "A team-based coding event to develop innovative solutions.",
                            "2026-12-05", "09:00",
                            "Computer Lab", "Computer Science Department", "100"
                        },

                        {
                            "AI and Data Science Workshop", "Technical",
                            "Learn practical applications of AI and data science.",
                            "2026-12-08", "10:00",
                            "Seminar Hall", "Data Science Department", "60"
                        },

                        {
                            "Web Development Bootcamp", "Technical",
                            "Hands-on HTML, CSS and JavaScript development session.",
                            "2026-12-12", "09:30",
                            "Computer Lab 2", "IT Department", "50"
                        },

                        {
                            "Cultural Fest", "Cultural",
                            "A celebration of music, dance, art and student talent.",
                            "2026-12-15", "10:00",
                            "College Auditorium", "Cultural Committee", "300"
                        },

                        {
                            "Dance Competition", "Cultural",
                            "An exciting dance competition for college students.",
                            "2026-12-17", "11:00",
                            "Main Auditorium", "Cultural Committee", "100"
                        },

                        {
                            "Singing Competition", "Cultural",
                            "Showcase your singing talent in a live competition.",
                            "2026-12-19", "11:00",
                            "Music Room", "Music Club", "80"
                        },

                        {
                            "Cricket Tournament", "Sports",
                            "Inter-department cricket tournament.",
                            "2026-12-22", "08:00",
                            "College Ground", "Sports Department", "120"
                        },

                        {
                            "Football Championship", "Sports",
                            "A football championship for college teams.",
                            "2026-12-24", "08:30",
                            "Sports Ground", "Sports Department", "100"
                        },

                        {
                            "Career Development Guest Lecture", "Academic",
                            "An expert session on career planning and opportunities.",
                            "2026-12-28", "10:30",
                            "Seminar Hall", "Training and Placement Cell", "150"
                        },

                        {
                            "Project Exhibition", "Academic",
                            "Students present their innovative academic projects.",
                            "2026-12-30", "09:00",
                            "Exhibition Hall", "Academic Committee", "200"
                        }
                    };

                    for (String[] activity : activities) {

                        for (int i = 0; i < 8; i++) {
                            ps.setString(i + 1, activity[i]);
                        }

                        ps.setString(9, activity[0]);
                        ps.setString(10, activity[3]);

                        ps.executeUpdate();
                    }
                }

                System.out.println(
                    "All database tables and activity columns are ready!"
                );

                System.out.println(
                    "Predefined activities have been added successfully!"
                );
            }

        } catch (Exception e) {
            System.out.println("Database initialization failed!");
            e.printStackTrace();
        }
    }
}
