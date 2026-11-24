
package campusiq;

public class Faculty extends Person implements Manageable {

    private int id;

    // Constructor
    public Faculty(int id, String name, String email,
                   String department) {

        super(name, email, department);
        this.id = id;
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

    // Method Overriding: Polymorphism
    @Override
    public void displayDetails() {

        System.out.println("Faculty ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Department: " + department);
    }
    @Override
    public void add() {
        System.out.println("Faculty Add Operation");
    }

    @Override
    public void view() {
        displayDetails();
    }

    @Override
    public void update() {
        System.out.println("Faculty Update Operation");
    }

    @Override
    public void delete() {
        System.out.println("Faculty Delete Operation");
    }
}
