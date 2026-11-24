
package campusiq;

import java.util.Scanner;

public class FacultyMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        FacultyDAO dao = new FacultyDAO();

        while (true) {

            System.out.println("\n===== CAMPUSIQ FACULTY MANAGEMENT =====");
            System.out.println("1. Add Faculty");
            System.out.println("2. View All Faculty");
            System.out.println("3. Update Faculty Department");
            System.out.println("4. Delete Faculty");
            System.out.println("5. Exit");

            System.out.print("Enter your choice: ");
            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {

                case 1:
                    System.out.print("Enter Name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter Email: ");
                    String email = sc.nextLine();

                    System.out.print("Enter Department: ");
                    String department = sc.nextLine();

                    Faculty faculty = new Faculty(
                        0, name, email, department
                    );

                    dao.addFaculty(faculty);
                    break;

                case 2:
                    dao.displayFaculty();
                    break;

                case 3:
                    System.out.print("Enter Faculty ID: ");
                    int updateId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter New Department: ");
                    String newDepartment = sc.nextLine();

                    dao.updateDepartment(updateId, newDepartment);
                    break;

                case 4:
                    System.out.print("Enter Faculty ID: ");
                    int deleteId = sc.nextInt();
                    sc.nextLine();

                    dao.deleteFaculty(deleteId);
                    break;

                
                case 5:
                    System.out.println("Returning to CampusIQ Main Menu...");
                    return;

                default:
                    System.out.println("Invalid choice. Try again.");
            }
        }
    }
}
