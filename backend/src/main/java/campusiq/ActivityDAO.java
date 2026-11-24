
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ActivityDAO {

    // CREATE: Add activity
    public void addActivity(CampusActivity activity) {

        String sql = "INSERT INTO campus_activities " +
                "(activity_name, description, activity_date, location) " +
                "VALUES (?, ?, ?, ?)";

        try (Connection con = DatabaseConnection.getConnection()) {

            if (con == null) {
                System.out.println("Database connection unavailable!");
                return;
            }

            try (PreparedStatement ps = con.prepareStatement(sql)) {

                ps.setString(1, activity.getActivityName());
                ps.setString(2, activity.getDescription());
                ps.setString(3, activity.getActivityDate());
                ps.setString(4, activity.getLocation());

                ps.executeUpdate();
                System.out.println("Activity added successfully!");
            }

        } catch (SQLException e) {
            System.out.println("Error adding activity: " + e.getMessage());
        }
    }

    // READ: Display all activities
    public void displayActivities() {

        String sql = "SELECT * FROM campus_activities";

        try (Connection con = DatabaseConnection.getConnection()) {

            if (con == null) {
                System.out.println("Database connection unavailable!");
                return;
            }

            try (PreparedStatement ps = con.prepareStatement(sql);
                 ResultSet rs = ps.executeQuery()) {

                System.out.println("\n----- CAMPUS ACTIVITIES -----");

                while (rs.next()) {

                    CampusActivity activity = new CampusActivity(
                            rs.getInt("id"),
                            rs.getString("activity_name"),
                            rs.getString("description"),
                            rs.getString("activity_date"),
                            rs.getString("location")
                    );

                    activity.displayDetails();
                    System.out.println("-----------------------------");
                }
            }

        } catch (SQLException e) {
            System.out.println("Error displaying activities: " + e.getMessage());
        }
    }

    // UPDATE: Update activity description
    public void updateActivity(int id, String description) {

        String sql = "UPDATE campus_activities SET description = ? WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection()) {

            if (con == null) {
                System.out.println("Database connection unavailable!");
                return;
            }

            try (PreparedStatement ps = con.prepareStatement(sql)) {

                ps.setString(1, description);
                ps.setInt(2, id);

                int rows = ps.executeUpdate();

                System.out.println(rows > 0
                        ? "Activity updated successfully!"
                        : "Activity ID not found.");
            }

        } catch (SQLException e) {
            System.out.println("Error updating activity: " + e.getMessage());
        }
    }

    // DELETE: Remove activity
    public void deleteActivity(int id) {

        String sql = "DELETE FROM campus_activities WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection()) {

            if (con == null) {
                System.out.println("Database connection unavailable!");
                return;
            }

            try (PreparedStatement ps = con.prepareStatement(sql)) {

                ps.setInt(1, id);

                int rows = ps.executeUpdate();

                System.out.println(rows > 0
                        ? "Activity deleted successfully!"
                        : "Activity ID not found.");
            }

        } catch (SQLException e) {
            System.out.println("Error deleting activity: " + e.getMessage());
        }
    }
}
