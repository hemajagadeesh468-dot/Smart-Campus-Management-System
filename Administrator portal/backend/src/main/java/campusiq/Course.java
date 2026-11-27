
package campusiq;

public class Course {

    private int id;
    private String courseName;
    private String courseCode;
    private int facultyId;

    // Constructor
    public Course(int id, String courseName,
                  String courseCode, int facultyId) {
        this.id = id;
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.facultyId = facultyId;
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public int getFacultyId() {
        return facultyId;
    }

    // Display course details
    public void displayDetails() {
        System.out.println("Course ID: " + id);
        System.out.println("Course Name: " + courseName);
        System.out.println("Course Code: " + courseCode);
        System.out.println("Faculty ID: " + facultyId);
    }
}
