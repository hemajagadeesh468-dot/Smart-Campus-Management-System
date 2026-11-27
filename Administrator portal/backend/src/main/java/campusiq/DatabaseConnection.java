
package campusiq;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

public class DatabaseConnection {

    private static final String URL = "jdbc:sqlite:database/campusiq.db";

    public static Connection getConnection() {
        try {
            Connection connection = DriverManager.getConnection(URL);

            // Enable foreign key constraints
            try (Statement statement = connection.createStatement()) {
                statement.execute("PRAGMA foreign_keys = ON");
            }

            System.out.println("Database connected successfully!");
            return connection;

        } catch (SQLException e) {
            System.out.println("Database connection failed!");
            e.printStackTrace();
            return null;
        }
    }
}
