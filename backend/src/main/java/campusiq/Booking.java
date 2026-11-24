
package campusiq;

public class Booking {

    private int id;
    private int studentId;
    private int resourceId;
    private String bookingDate;
    private String status;

    public Booking(int id, int studentId, int resourceId,
                   String bookingDate, String status) {

        this.id = id;
        this.studentId = studentId;
        this.resourceId = resourceId;
        this.bookingDate = bookingDate;
        this.status = status;
    }

    public int getId() {
        return id;
    }

    public int getStudentId() {
        return studentId;
    }

    public int getResourceId() {
        return resourceId;
    }

    public String getBookingDate() {
        return bookingDate;
    }

    public String getStatus() {
        return status;
    }

    public void displayDetails() {
        System.out.println("Booking ID: " + id);
        System.out.println("Student ID: " + studentId);
        System.out.println("Resource ID: " + resourceId);
        System.out.println("Booking Date: " + bookingDate);
        System.out.println("Status: " + status);
    }
}
