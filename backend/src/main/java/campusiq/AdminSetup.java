
package campusiq;

import java.util.Scanner;

public class AdminSetup {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        AdministratorDAO dao = new AdministratorDAO();

        System.out.println("===== CAMPUSIQ ADMIN REGISTRATION =====");

        System.out.print("Enter Admin Name: ");
        String name = sc.nextLine();

        System.out.print("Enter Email: ");
        String email = sc.nextLine();

        System.out.print("Enter Password: ");
        String password = sc.nextLine();

        System.out.print("Enter Designation: ");
        String designation = sc.nextLine();

        System.out.print("Enter Department: ");
        String department = sc.nextLine();

        System.out.print("Enter Phone: ");
        String phone = sc.nextLine();

        if (name.isBlank() || email.isBlank() || password.isBlank()) {
            System.out.println("Name, email and password are required!");
        } else {
            dao.addAdministrator(
                name, email, password,
                designation, department, phone
            );
        }

        sc.close();
    }
}
