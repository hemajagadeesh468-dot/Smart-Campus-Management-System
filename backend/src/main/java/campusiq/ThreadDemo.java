
package campusiq;

public class ThreadDemo {

    public static void main(String[] args) {

        System.out.println(
            "===== SIMULTANEOUS BOOKING DEMONSTRATION ====="
        );

        // Both threads attempt to book Resource 1
        // on the same date.

        BookingTask user1 = new BookingTask(
            "Student 1", 1, 1, "2026-12-20"
        );

        BookingTask user2 = new BookingTask(
            "Student 2", 1, 1, "2026-12-20"
        );

        user1.start();
        user2.start();
    }
}
