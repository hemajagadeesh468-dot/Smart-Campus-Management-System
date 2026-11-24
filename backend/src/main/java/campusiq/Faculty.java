
package campusiq;

public class Faculty {

    private int id;
    private String name;
    private String email;
    private String department;

    // Constructor
    public Faculty(int id, String name, String email, String department) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getDepartment() {
        return department;
    }

    // Display faculty details
    public void displayDetails() {
        System.out.println("Faculty ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Department: " + department);
    }
}
