
package campusiq;

public class Student {

    private int id;
    private String name;
    private String email;
    private String department;
    private int year;

    // Constructor
    public Student(int id, String name, String email,
                   String department, int year) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.department = department;
        this.year = year;
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

    public int getYear() {
        return year;
    }

    // Display student details
    public void displayDetails() {
        System.out.println("Student ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Department: " + department);
        System.out.println("Year: " + year);
    }
}
