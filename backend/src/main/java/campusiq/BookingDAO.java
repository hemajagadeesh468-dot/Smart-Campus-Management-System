
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class BookingDAO {

    // Add a new booking
    public void addBooking(Booking booking) {

        String sql = "INSERT INTO bookings (student_id, resource_id, booking_date, status) VALUES (?, ?, ?, ?)";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, booking.getStudentId());
            ps.setInt(2, booking.getResourceId());
            ps.setString(3, booking.getBookingDate());
            ps.setString(4, booking.getStatus());

            ps.executeUpdate();

            System.out.println("Booking added successfully!");

        } catch (SQLException e) {
            System.out.println("Error adding booking!");
            e.printStackTrace();
        }
    }

    // Display all bookings
    public void displayBookings() {

        String sql = """
            SELECT b.id, b.student_id, s.name AS student_name,
                   b.resource_id, r.resource_name,
                   b.booking_date, b.status
            FROM bookings b
            LEFT JOIN students s ON b.student_id = s.id
            LEFT JOIN resources r ON b.resource_id = r.id
            """;

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            System.out.println("\n----- BOOKING RECORDS -----");

            while (rs.next()) {

                System.out.println("Booking ID: " + rs.getInt("id"));
                System.out.println("Student ID: " + rs.getInt("student_id"));
                System.out.println("Student Name: " + rs.getString("student_name"));
                System.out.println("Resource ID: " + rs.getInt("resource_id"));
                System.out.println("Resource Name: " + rs.getString("resource_name"));
                System.out.println("Booking Date: " + rs.getString("booking_date"));
                System.out.println("Status: " + rs.getString("status"));

                System.out.println("---------------------------");
            }

        } catch (SQLException e) {
            System.out.println("Error displaying bookings!");
            e.printStackTrace();
        }
    }

    // Update booking status
    public void updateBookingStatus(int id, String status) {

        String sql = "UPDATE bookings SET status = ? WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, status);
            ps.setInt(2, id);

            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("Booking status updated successfully!");
            } else {
                System.out.println("Booking not found!");
            }

        } catch (SQLException e) {
            System.out.println("Error updating booking!");
            e.printStackTrace();
        }
    }

    // Delete booking
    public void deleteBooking(int id) {

        String sql = "DELETE FROM bookings WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            int rows = ps.executeUpdate();

            if (rows > 0) {
                System.out.println("Booking deleted successfully!");
            } else {
                System.out.println("Booking not found!");
            }

        } catch (SQLException e) {
            System.out.println("Error deleting booking!");
            e.printStackTrace();
        }
    }
}
