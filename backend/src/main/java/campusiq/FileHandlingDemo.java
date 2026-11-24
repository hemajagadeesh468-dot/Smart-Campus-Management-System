
package campusiq;

import java.io.FileWriter;
import java.io.FileReader;
import java.io.BufferedReader;
import java.io.IOException;

public class FileHandlingDemo {

    public static void main(String[] args) {

        // Writing student details into a file
        try (FileWriter writer = new FileWriter("students.txt")) {

            writer.write("Student Name: Ananya\n");
            writer.write("Email: ananya@gmail.com\n");
            writer.write("Department: Cyber Security\n");
            writer.write("Year: 2\n");

            System.out.println("Student details saved successfully!");

        } catch (IOException e) {
            System.out.println("Error writing file: " + e.getMessage());
        }

        // Reading student details from the file
        try (BufferedReader reader =
                 new BufferedReader(new FileReader("students.txt"))) {

            String line;

            System.out.println("\n===== STUDENT DETAILS FROM FILE =====");

            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }

        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
    }
}

