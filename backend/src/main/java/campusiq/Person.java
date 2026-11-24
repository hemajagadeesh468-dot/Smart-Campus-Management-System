
package campusiq;

public class Person {

    protected String name;
    protected String email;
    protected String department;

    public Person(String name, String email, String department) {
        this.name = name;
        this.email = email;
        this.department = department;
    }

    public void displayDetails() {
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Department: " + department);
    }
}
