
package campusiq;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.Statement;

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

                System.out.println("All database tables created successfully!");
            }

        } catch (Exception e) {
            System.out.println("Database initialization failed!");
            e.printStackTrace();
        }
    }
}
