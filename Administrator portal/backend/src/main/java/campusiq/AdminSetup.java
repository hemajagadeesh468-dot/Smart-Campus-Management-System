
package campusiq;

import java.util.Scanner;

public class AdminSetup {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        AdministratorDAO dao = new AdministratorDAO();

        System.out.println("===== CAMPUSIQ ADMIN REGISTRATION =====");

        System.out.print("Enter Email: ");
        String email = sc.nextLine().trim();

        System.out.print("Enter Password: ");
        String password = sc.nextLine();

        if (email.isBlank() || password.isBlank()) {
            System.out.println("Email and Password are required!");
        } else {
            boolean success = dao.addAdministrator(
                "Administrator",
                email,
                password,
                "Admin",
                "Administration",
                ""
            );

            if (success) {
                System.out.println("Admin account created successfully!");
            }
        }

        sc.close();
    }
}
