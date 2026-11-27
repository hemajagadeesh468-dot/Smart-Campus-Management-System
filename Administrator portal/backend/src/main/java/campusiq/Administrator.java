
package campusiq;

public class Administrator {

    private int id;
    private String name;
    private String email;
    private String passwordHash;
    private String salt;
    private String designation;
    private String department;
    private String phone;

    public Administrator(int id, String name, String email,
                         String passwordHash, String salt,
                         String designation, String department,
                         String phone) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.designation = designation;
        this.department = department;
        this.phone = phone;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getSalt() {
        return salt;
    }

    public String getDesignation() {
        return designation;
    }

    public String getDepartment() {
        return department;
    }

    public String getPhone() {
        return phone;
    }
}
