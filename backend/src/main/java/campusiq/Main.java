
package campusiq;

public class Main {

    public static void main(String[] args) {

        System.out.println("================================");
        System.out.println("       WELCOME TO CAMPUSIQ");
        System.out.println(" Smart Campus Management System");
        System.out.println("================================");

        DatabaseInitializer.initialize();

        MainMenu.main(args);
    }
}
