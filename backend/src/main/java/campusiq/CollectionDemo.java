
package campusiq;

import java.util.ArrayList;
import java.util.Scanner;

public class CollectionDemo {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        ArrayList<String> students = new ArrayList<>();

        System.out.println("===== CAMPUSIQ STUDENT COLLECTION =====");

        System.out.print("Enter number of students: ");
        int count = sc.nextInt();
        sc.nextLine();

        // Add student names
        for (int i = 0; i < count; i++) {

            System.out.print("Enter student name: ");
            String name = sc.nextLine();

            students.add(name);
        }

        // Display students
        System.out.println("\n===== STUDENT LIST =====");

        for (String name : students) {
            System.out.println(name);
        }

        // Display total students
        System.out.println("\nTotal Students: " + students.size());

        // Remove a student
        System.out.print("\nEnter student name to remove: ");
        String removeName = sc.nextLine();

        if (students.remove(removeName)) {
            System.out.println("Student removed successfully!");
        } else {
            System.out.println("Student not found!");
        }

        // Display updated list
        System.out.println("\n===== UPDATED STUDENT LIST =====");

        for (String name : students) {
            System.out.println(name);
        }

        System.out.println("Total Students: " + students.size());
    }
}
