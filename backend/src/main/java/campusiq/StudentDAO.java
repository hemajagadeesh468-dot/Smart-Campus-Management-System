
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class StudentDAO {

    // CREATE: Add student
    public void addStudent(Student student) {

        String sql = "INSERT INTO students(name, email, department, year) VALUES (?, ?, ?, ?)";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, student.getName());
            ps.setString(2, student.getEmail());
            ps.setString(3, student.getDepartment());
            ps.setInt(4, student.getYear());

            ps.executeUpdate();
            System.out.println("Student added successfully!");

        } catch (SQLException e) {
            System.out.println("Unable to add student: " + e.getMessage());
        }
    }

    // READ: Display all students
    public void displayStudents() {

        String sql = "SELECT * FROM students";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            System.out.println("\n----- STUDENT RECORDS -----");

            while (rs.next()) {
                Student student = new Student(
                    rs.getInt("id"),
                    rs.getString("name"),
                    rs.getString("email"),
                    rs.getString("department"),
                    rs.getInt("year")
                );

                student.displayDetails();
                System.out.println("---------------------------");
            }

        } catch (SQLException e) {
            System.out.println("Unable to display students: " + e.getMessage());
        }
    }

    // UPDATE: Update student department
    public void updateDepartment(int id, String department) {

        String sql = "UPDATE students SET department = ? WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, department);
            ps.setInt(2, id);

            int rows = ps.executeUpdate();

            System.out.println(rows > 0
                ? "Student updated successfully!"
                : "Student ID not found.");

        } catch (SQLException e) {
            System.out.println("Unable to update student: " + e.getMessage());
        }
    }

    // DELETE: Remove student
    public void deleteStudent(int id) {

        String sql = "DELETE FROM students WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rows = ps.executeUpdate();

            System.out.println(rows > 0
                ? "Student deleted successfully!"
                : "Student ID not found.");

        } catch (SQLException e) {
            System.out.println("Unable to delete student: " + e.getMessage());
        }
    }
}
