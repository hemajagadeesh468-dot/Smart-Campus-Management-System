
package campusiq;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AdministratorDAO {

    // Register a new administrator
    public boolean addAdministrator(
            String name, String email, String password,
            String designation, String department, String phone) {

        String salt = PasswordUtil.generateSalt();
        String passwordHash = PasswordUtil.hashPassword(password, salt);

        String sql = """
            INSERT INTO administrators
            (name, email, password_hash, salt, designation, department, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            ps.setString(4, salt);
            ps.setString(5, designation);
            ps.setString(6, department);
            ps.setString(7, phone);

            ps.executeUpdate();

            System.out.println("Administrator registered successfully!");
            return true;

        } catch (SQLException e) {
            System.out.println("Administrator registration failed: " + e.getMessage());
            return false;
        }
    }

    // Verify administrator login
    public Administrator login(String email, String password) {

        String sql = """
            SELECT * FROM administrators WHERE email = ?
            """;

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    String salt = rs.getString("salt");
                    String storedHash = rs.getString("password_hash");

                    if (PasswordUtil.verifyPassword(
                            password, salt, storedHash)) {

                        return new Administrator(
                            rs.getInt("id"),
                            rs.getString("name"),
                            rs.getString("email"),
                            storedHash,
                            salt,
                            rs.getString("designation"),
                            rs.getString("department"),
                            rs.getString("phone")
                        );
                    }
                }
            }

        } catch (SQLException e) {
            System.out.println("Login error: " + e.getMessage());
        }

        return null;
    }

    // Retrieve administrator profile
    public Administrator getAdministrator(int id) {

        String sql = "SELECT * FROM administrators WHERE id = ?";

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return new Administrator(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("password_hash"),
                        rs.getString("salt"),
                        rs.getString("designation"),
                        rs.getString("department"),
                        rs.getString("phone")
                    );
                }
            }

        } catch (SQLException e) {
            System.out.println("Profile retrieval error: " + e.getMessage());
        }

        return null;
    }

    // Update administrator profile
    public boolean updateProfile(
            int id, String name, String email,
            String designation, String department, String phone) {

        String sql = """
            UPDATE administrators
            SET name = ?, email = ?, designation = ?,
                department = ?, phone = ?
            WHERE id = ?
            """;

        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, designation);
            ps.setString(4, department);
            ps.setString(5, phone);
            ps.setInt(6, id);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            System.out.println("Profile update failed: " + e.getMessage());
            return false;
        }
    }
}
