
package campusiq;

public class BookingTask extends Thread {

    private String userName;
    private int studentId;
    private int resourceId;
    private String bookingDate;

    private static final Object bookingLock = new Object();

    public BookingTask(
        String userName,
        int studentId,
        int resourceId,
        String bookingDate
    ) {
        this.userName = userName;
        this.studentId = studentId;
        this.resourceId = resourceId;
        this.bookingDate = bookingDate;
    }

    @Override
    public void run() {

        synchronized (bookingLock) {

            System.out.println(
                "\n" + userName + " is checking resource availability..."
            );

            Booking booking = new Booking(
                0,
                studentId,
                resourceId,
                bookingDate,
                "booked"
            );

            System.out.println(
                userName + " is processing the booking..."
            );

            BookingDAO dao = new BookingDAO();
            dao.addBooking(booking);

            System.out.println(
                userName + " completed the booking attempt."
            );
        }
    }
}
