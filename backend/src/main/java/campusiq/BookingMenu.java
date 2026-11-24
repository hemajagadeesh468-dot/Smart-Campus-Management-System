
package campusiq;

import java.util.Scanner;

public class BookingMenu {

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        BookingDAO dao = new BookingDAO();

        while (true) {

            System.out.println("\n===== CAMPUSIQ BOOKING MANAGEMENT =====");
            System.out.println("1. Add Booking");
            System.out.println("2. View All Bookings");
            System.out.println("3. Update Booking Status");
            System.out.println("4. Delete Booking");
            System.out.println("5. Exit");
            System.out.print("Enter your choice: ");

            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {

                case 1:
                    System.out.print("Enter Student ID: ");
                    int studentId = sc.nextInt();

                    System.out.print("Enter Resource ID: ");
                    int resourceId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter Booking Date (YYYY-MM-DD): ");
                    String date = sc.nextLine();

                    System.out.print("Enter Status (Booked/Cancelled): ");
                    String status = sc.nextLine();

                    Booking booking = new Booking(
                        0, studentId, resourceId, date, status
                    );

                    dao.addBooking(booking);
                    break;

                case 2:
                    dao.displayBookings();
                    break;

                case 3:
                    System.out.print("Enter Booking ID: ");
                    int updateId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter New Status: ");
                    String newStatus = sc.nextLine();

                    dao.updateBookingStatus(updateId, newStatus);
                    break;

                case 4:
                    System.out.print("Enter Booking ID to Delete: ");
                    int deleteId = sc.nextInt();

                    dao.deleteBooking(deleteId);
                    break;

                case 5:
                    System.out.println("Exiting Booking Management...");
                    return;

                default:
                    System.out.println("Invalid choice! Try again.");
            }
        }
    }
}
