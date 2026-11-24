
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CourseDAO {

    // CREATE: Add course
    public void addCourse(Course course) {

        String sql = "INSERT INTO courses(course_name, course_code, faculty_id) VALUES (?, ?, ?)";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, course.getCourseName());
            ps.setString(2, course.getCourseCode());
            ps.setInt(3, course.getFacultyId());

            ps.executeUpdate();
            System.out.println("Course added successfully!");

        } catch (SQLException e) {
            System.out.println("Unable to add course: " + e.getMessage());
        }
    }

    // READ: Display all courses
    public void displayCourses() {

        String sql = """
            SELECT c.id, c.course_name, c.course_code,
                   c.faculty_id, f.name AS faculty_name
            FROM courses c
            LEFT JOIN faculty f ON c.faculty_id = f.id
            """;

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            System.out.println("\n----- COURSE RECORDS -----");

            while (rs.next()) {
                System.out.println("Course ID: " + rs.getInt("id"));
                System.out.println("Course Name: " + rs.getString("course_name"));
                System.out.println("Course Code: " + rs.getString("course_code"));
                System.out.println("Faculty ID: " + rs.getInt("faculty_id"));
                System.out.println("Faculty Name: " + rs.getString("faculty_name"));
                System.out.println("--------------------------");
            }

        } catch (SQLException e) {
            System.out.println("Unable to display courses: " + e.getMessage());
        }
    }

    // UPDATE: Change course name
    public void updateCourse(int id, String newName) {

        String sql = "UPDATE courses SET course_name = ? WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, newName);
            ps.setInt(2, id);

            int rows = ps.executeUpdate();

            System.out.println(rows > 0
                ? "Course updated successfully!"
                : "Course ID not found.");

        } catch (SQLException e) {
            System.out.println("Unable to update course: " + e.getMessage());
        }
    }

    // DELETE: Remove course
    public void deleteCourse(int id) {

        String sql = "DELETE FROM courses WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rows = ps.executeUpdate();

            System.out.println(rows > 0
                ? "Course deleted successfully!"
                : "Course ID not found.");

        } catch (SQLException e) {
            System.out.println("Unable to delete course: " + e.getMessage());
        }
    }
}
