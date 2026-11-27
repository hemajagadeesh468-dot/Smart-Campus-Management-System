
package campusiq;

import java.util.Scanner;

public class CourseMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        CourseDAO dao = new CourseDAO();

        while (true) {

            System.out.println("\n===== CAMPUSIQ COURSE MANAGEMENT =====");
            System.out.println("1. Add Course");
            System.out.println("2. View All Courses");
            System.out.println("3. Update Course Name");
            System.out.println("4. Delete Course");
            System.out.println("5. Exit");

            System.out.print("Enter your choice: ");
            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {

                case 1:
                    System.out.print("Enter Course Name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter Course Code: ");
                    String code = sc.nextLine();

                    System.out.print("Enter Faculty ID: ");
                    int facultyId = sc.nextInt();
                    sc.nextLine();

                    Course course = new Course(
                        0, name, code, facultyId
                    );

                    dao.addCourse(course);
                    break;

                case 2:
                    dao.displayCourses();
                    break;

                case 3:
                    System.out.print("Enter Course ID: ");
                    int updateId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter New Course Name: ");
                    String newName = sc.nextLine();

                    dao.updateCourse(updateId, newName);
                    break;

                case 4:
                    System.out.print("Enter Course ID: ");
                    int deleteId = sc.nextInt();
                    sc.nextLine();

                    dao.deleteCourse(deleteId);
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
