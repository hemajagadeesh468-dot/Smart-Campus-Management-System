
package campusiq;

import java.util.Scanner;

public class StudentMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        StudentDAO dao = new StudentDAO();

        while (true) {

            System.out.println("\n===== CAMPUSIQ STUDENT MANAGEMENT =====");
            System.out.println("1. Add Student");
            System.out.println("2. View All Students");
            System.out.println("3. Search Student");
            System.out.println("4. Update Student Department");
            System.out.println("5. Delete Student");
            System.out.println("6. Exit");

            System.out.print("Enter your choice: ");
            int choice;

            try {
                choice = sc.nextInt();
                sc.nextLine();
            } catch (java.util.InputMismatchException e) {
                System.out.println("Invalid input! Please enter a number.");
                sc.nextLine();
                continue;
            }
            
            sc.nextLine();

            switch (choice) {

                case 1:
                    System.out.print("Enter Name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter Email: ");
                    String email = sc.nextLine();

                    System.out.print("Enter Department: ");
                    String department = sc.nextLine();

                    System.out.print("Enter Year: ");
                    int year = sc.nextInt();
                    sc.nextLine();

                    Student student = new Student(
                        0, name, email, department, year
                    );

                    dao.addStudent(student);
                    break;

                case 2:
                    dao.displayStudents();
                    break;

                case 3:
                    System.out.print("Enter name, email or department to search: ");
                    String keyword = sc.nextLine();
                    dao.searchStudent(keyword);
                    break;

                case 4:
                    System.out.print("Enter Student ID: ");
                    int updateId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter New Department: ");
                    String newDepartment = sc.nextLine();

                    dao.updateDepartment(updateId, newDepartment);
                    break;

                case 5:
                    System.out.print("Enter Student ID: ");
                    int deleteId = sc.nextInt();
                    sc.nextLine();

                    dao.deleteStudent(deleteId);
                    break;

                case 6:
                    System.out.println("Returning to CampusIQ Main Menu...");
                    return;

                default:
                    System.out.println("Invalid choice. Try again.");
            }
        }
    }
}
