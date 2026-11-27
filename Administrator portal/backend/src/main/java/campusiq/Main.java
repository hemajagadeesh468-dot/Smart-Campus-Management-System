
package campusiq;

public class Main {

    public static void main(String[] args) {

        System.out.println("================================");
        System.out.println("       WELCOME TO CAMPUSIQ");
        System.out.println(" Smart Campus Management System");
        System.out.println("================================");

        // Interface Demonstration
        Manageable studentManager = new Student(
            1, "Ananya", "ananya@gmail.com",
            "Cyber Security", 2
        );

        System.out.println("\n----- INTERFACE DEMONSTRATION -----");
        studentManager.view();
        studentManager.add();
        studentManager.update();
        studentManager.delete();
        
        // Runtime Polymorphism
        Person person1 = new Student(
            1, "Ananya", "ananya@gmail.com",
            "Cyber Security", 2
        );

        Person person2 = new Faculty(
            2, "Priya", "priya@gmail.com",
            "Data Science"
        );

        System.out.println("\n----- STUDENT DETAILS -----");
        person1.displayDetails();

        System.out.println("\n----- FACULTY DETAILS -----");
        person2.displayDetails();

        DatabaseInitializer.initialize();
        MainMenu.main(args);
    }
}
