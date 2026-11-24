
package campusiq;

import java.util.Scanner;

public class MainMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        int choice;

        do {
            System.out.println("\n================================");
            System.out.println("       CAMPUSIQ MANAGEMENT");
            System.out.println("================================");
            System.out.println("1. Student Management");
            System.out.println("2. Faculty Management");
            System.out.println("3. Course Management");
            System.out.println("4. Resource Management");
            System.out.println("5. Booking Management");
            System.out.println("6. Campus Activity Management");
            System.out.println("7. Exit");
            System.out.println("================================");
            System.out.print("Enter your choice: ");

            choice = sc.nextInt();

            switch (choice) {

                case 1:
                    StudentMenu.main(args);
                    break;

                case 2:
                    FacultyMenu.main(args);
                    break;

                case 3:
                    CourseMenu.main(args);
                    break;

                case 4:
                    ResourceMenu.main(args);
                    break;

                case 5:
                    BookingMenu.main(args);
                    break;

                case 6:
                    ActivityMenu.main(args);
                    break;

                case 7:
                    System.out.println("Thank you for using CampusIQ!");
                    break;

                default:
                    System.out.println("Invalid choice! Try again.");
            }

        } while (choice != 7);

        sc.close();
    }
}
