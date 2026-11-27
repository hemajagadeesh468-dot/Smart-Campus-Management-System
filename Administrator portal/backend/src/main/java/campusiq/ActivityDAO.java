
package campusiq;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ActivityDAO {

    // Add a new activity
    public boolean addActivity(CampusActivity activity) {

        String sql = "INSERT INTO campus_activities " +
                "(activity_name, activity_type, description, activity_date, " +
                "activity_time, location, organizer, capacity) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, activity.getActivityName());
            statement.setString(2, activity.getActivityType());
            statement.setString(3, activity.getDescription());
            statement.setString(4, activity.getActivityDate());
            statement.setString(5, activity.getActivityTime());
            statement.setString(6, activity.getLocation());
            statement.setString(7, activity.getOrganizer());
            statement.setInt(8, activity.getCapacity());

            return statement.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Retrieve all activities
    public List<CampusActivity> getAllActivities() {

        List<CampusActivity> activities = new ArrayList<>();

        String sql = "SELECT * FROM campus_activities ORDER BY id DESC";

        try (Connection connection = DatabaseConnection.getConnection();
             Statement statement = connection.createStatement();
             ResultSet result = statement.executeQuery(sql)) {

            while (result.next()) {

                CampusActivity activity = new CampusActivity(
                        result.getInt("id"),
                        result.getString("activity_name"),
                        result.getString("activity_type"),
                        result.getString("description"),
                        result.getString("activity_date"),
                        result.getString("activity_time"),
                        result.getString("location"),
                        result.getString("organizer"),
                        result.getInt("capacity")
                );

                activities.add(activity);
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return activities;
    }

    // Update an existing activity
    public boolean updateActivity(CampusActivity activity) {

        String sql = "UPDATE campus_activities SET " +
                "activity_name = ?, activity_type = ?, description = ?, " +
                "activity_date = ?, activity_time = ?, location = ?, " +
                "organizer = ?, capacity = ? WHERE id = ?";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, activity.getActivityName());
            statement.setString(2, activity.getActivityType());
            statement.setString(3, activity.getDescription());
            statement.setString(4, activity.getActivityDate());
            statement.setString(5, activity.getActivityTime());
            statement.setString(6, activity.getLocation());
            statement.setString(7, activity.getOrganizer());
            statement.setInt(8, activity.getCapacity());
            statement.setInt(9, activity.getId());

            return statement.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Keep the older description-only update method
    public void updateActivity(int id, String description) {

        String sql = "UPDATE campus_activities SET description = ? WHERE id = ?";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, description);
            statement.setInt(2, id);
            statement.executeUpdate();

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    // Delete an activity
    public boolean deleteActivityById(int id) {

        String sql = "DELETE FROM campus_activities WHERE id = ?";

        try (Connection connection = DatabaseConnection.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setInt(1, id);
            return statement.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Keep the older delete method
    public void deleteActivity(int id) {
        deleteActivityById(id);
    }

    // Display activities in the terminal
    public void displayActivities() {

        List<CampusActivity> activities = getAllActivities();

        if (activities.isEmpty()) {
            System.out.println("No activities found.");
            return;
        }

        for (CampusActivity activity : activities) {
            activity.displayDetails();
            System.out.println("----------------------------");
        }
    }
}
