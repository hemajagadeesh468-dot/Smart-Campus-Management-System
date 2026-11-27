
package campusiq;

import java.util.Scanner;

public class ResourceMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        ResourceDAO dao = new ResourceDAO();

        while (true) {

            System.out.println("\n===== CAMPUSIQ RESOURCE MANAGEMENT =====");
            System.out.println("1. Add Resource");
            System.out.println("2. View All Resources");
            System.out.println("3. Update Resource Availability");
            System.out.println("4. Delete Resource");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");

            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {

                case 1:
                    System.out.print("Enter Resource Name: ");
                    String name = sc.nextLine();

                    System.out.print("Enter Resource Type: ");
                    String type = sc.nextLine();

                    System.out.print("Enter Availability (Available/Unavailable): ");
                    String availability = sc.nextLine();

                    Resource resource = new Resource(
                        0, name, type, availability
                    );

                    dao.addResource(resource);
                    break;

                case 2:
                    dao.displayResources();
                    break;

                case 3:
                    System.out.print("Enter Resource ID: ");
                    int updateId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter New Availability: ");
                    String newAvailability = sc.nextLine();

                    dao.updateAvailability(updateId, newAvailability);
                    break;

                case 4:
                    System.out.print("Enter Resource ID to Delete: ");
                    int deleteId = sc.nextInt();

                    dao.deleteResource(deleteId);
                    break;

                case 5:
                    System.out.println("Exiting Resource Management...");
                    return;

                default:
                    System.out.println("Invalid choice! Try again.");
            }
        }
    }
}
