
package campusiq;

import java.util.Scanner;

public class ActivityMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        ActivityDAO dao = new ActivityDAO();

        int choice;

        do {
            System.out.println("\n===== CAMPUS ACTIVITY MANAGEMENT =====");
            System.out.println("1. Add Activity");
            System.out.println("2. View All Activities");
            System.out.println("3. Update Activity");
            System.out.println("4. Delete Activity");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");

            choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {

                case 1:
                    System.out.print("Enter activity name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter description: ");
                    String description = sc.nextLine();

                    System.out.print("Enter activity date (YYYY-MM-DD): ");
                    String date = sc.nextLine();

                    System.out.print("Enter location: ");
                    String location = sc.nextLine();

                    CampusActivity activity =
                            new CampusActivity(name, description, date, location);

                    dao.addActivity(activity);
                    break;

                case 2:
                    dao.displayActivities();
                    break;

                case 3:
                    System.out.print("Enter Activity ID: ");
                    int updateId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter new description: ");
                    String newDescription = sc.nextLine();

                    dao.updateActivity(updateId, newDescription);
                    break;

                case 4:
                    System.out.print("Enter Activity ID to delete: ");
                    int deleteId = sc.nextInt();

                    dao.deleteActivity(deleteId);
                    break;

                case 5:
                    System.out.println("Returning to CampusIQ Main Menu...");
                    return;

                default:
                    System.out.println("Invalid choice! Try again.");
            }

        } while (choice != 5);
    }
}
