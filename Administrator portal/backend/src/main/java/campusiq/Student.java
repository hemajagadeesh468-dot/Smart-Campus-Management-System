
package campusiq;

public class Student extends Person implements Manageable {

    private int id;
    private int year;

    // Constructor
    public Student(int id, String name, String email,
                   String department, int year) {

        super(name, email, department);

        this.id = id;
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

    // Method Overriding: Polymorphism
    @Override
    public void displayDetails() {

        System.out.println("Student ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Department: " + department);
        System.out.println("Year: " + year);
    }
    @Override
    public void add() {
        System.out.println("Student Add Operation");
    }

    @Override
    public void view() {
        displayDetails();
    }

    @Override
    public void update() {
        System.out.println("Student Update Operation");
    }

    @Override
    public void delete() {
        System.out.println("Student Delete Operation");
    }
}
