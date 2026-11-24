
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class FacultyDAO {

    // CREATE: Add faculty
    public void addFaculty(Faculty faculty) {

        String sql = "INSERT INTO faculty(name, email, department) VALUES (?, ?, ?)";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, faculty.getName());
            ps.setString(2, faculty.getEmail());
            ps.setString(3, faculty.getDepartment());

            ps.executeUpdate();
            System.out.println("Faculty added successfully!");

        } catch (SQLException e) {
            System.out.println("Unable to add faculty: " + e.getMessage());
        }
    }

    // READ: Display all faculty
    public void displayFaculty() {

        String sql = "SELECT * FROM faculty";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            System.out.println("\n----- FACULTY RECORDS -----");

            while (rs.next()) {

                Faculty faculty = new Faculty(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("department")
                );

                faculty.displayDetails();
                System.out.println("---------------------------");
            }

        } catch (SQLException e) {
            System.out.println("Unable to display faculty: " + e.getMessage());
        }
    }

    // UPDATE: Change faculty department
    public void updateDepartment(int id, String department) {

        String sql = "UPDATE faculty SET department = ? WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, department);
            ps.setInt(2, id);

            int rows = ps.executeUpdate();

            System.out.println(rows > 0
                ? "Faculty updated successfully!"
                : "Faculty ID not found.");

        } catch (SQLException e) {
            System.out.println("Unable to update faculty: " + e.getMessage());
        }
    }

    // DELETE: Remove faculty
    public void deleteFaculty(int id) {

        String sql = "DELETE FROM faculty WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rows = ps.executeUpdate();

            System.out.println(rows > 0
                ? "Faculty deleted successfully!"
                : "Faculty ID not found.");

        } catch (SQLException e) {
            System.out.println("Unable to delete faculty: " + e.getMessage());
        }
    }
}
