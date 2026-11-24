
package campusiq;

import java.util.Arrays;
import java.util.List;

public class LambdaStreamDemo {

    public static void main(String[] args) {

        List<String> students = Arrays.asList(
            "Ananya", "Harshi", "Rahul", "Priya", "Ammu"
        );

        System.out.println("===== LAMBDA EXPRESSION =====");

        // Lambda expression
        students.forEach(name -> System.out.println(name));

        System.out.println("\n===== STREAM API =====");

        // Stream: Display names starting with A
        students.stream()
                .filter(name -> name.startsWith("A"))
                .forEach(name -> System.out.println(name));

        // Count total students
        long total = students.stream().count();

        System.out.println("\nTotal Students: " + total);
    }
}
