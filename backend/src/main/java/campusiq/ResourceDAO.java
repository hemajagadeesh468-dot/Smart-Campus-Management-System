
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ResourceDAO {

    public void addResource(Resource resource) {
        String sql = "INSERT INTO resources (resource_name, resource_type, availability) VALUES (?, ?, ?)";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, resource.getResourceName());
            ps.setString(2, resource.getResourceType());
            ps.setString(3, resource.getAvailability());

            ps.executeUpdate();
            System.out.println("Resource added successfully!");

        } catch (SQLException e) {
            System.out.println("Error adding resource!");
            e.printStackTrace();
        }
    }

    public void displayResources() {
        String sql = "SELECT * FROM resources";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            System.out.println("\n----- RESOURCE RECORDS -----");

            while (rs.next()) {
                Resource resource = new Resource(
                    rs.getInt("id"),
                    rs.getString("resource_name"),
                    rs.getString("resource_type"),
                    rs.getString("availability")
                );

                resource.displayDetails();
                System.out.println("---------------------------");
            }

        } catch (SQLException e) {
            System.out.println("Error displaying resources!");
            e.printStackTrace();
        }
    }

    public void updateAvailability(int id, String availability) {
        String sql = "UPDATE resources SET availability = ? WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, availability);
            ps.setInt(2, id);

            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("Resource updated successfully!");
            } else {
                System.out.println("Resource not found!");
            }

        } catch (SQLException e) {
            System.out.println("Error updating resource!");
            e.printStackTrace();
        }
    }

    public void deleteResource(int id) {
        String sql = "DELETE FROM resources WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("Resource deleted successfully!");
            } else {
                System.out.println("Resource not found!");
            }

        } catch (SQLException e) {
            System.out.println("Error deleting resource!");
            e.printStackTrace();
        }
    }
}
