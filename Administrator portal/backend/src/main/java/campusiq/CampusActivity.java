
package campusiq;

public class CampusActivity {

    private int id;
    private String activityName;
    private String activityType;
    private String description;
    private String activityDate;
    private String activityTime;
    private String location;
    private String organizer;
    private int capacity;

    // Constructor for adding a new activity
    public CampusActivity(
            String activityName,
            String activityType,
            String description,
            String activityDate,
            String activityTime,
            String location,
            String organizer,
            int capacity) {

        this.activityName = activityName;
        this.activityType = activityType;
        this.description = description;
        this.activityDate = activityDate;
        this.activityTime = activityTime;
        this.location = location;
        this.organizer = organizer;
        this.capacity = capacity;
    }

    // Constructor for retrieving an existing activity
    public CampusActivity(
            int id,
            String activityName,
            String activityType,
            String description,
            String activityDate,
            String activityTime,
            String location,
            String organizer,
            int capacity) {

        this.id = id;
        this.activityName = activityName;
        this.activityType = activityType;
        this.description = description;
        this.activityDate = activityDate;
        this.activityTime = activityTime;
        this.location = location;
        this.organizer = organizer;
        this.capacity = capacity;
    }

    // Existing constructors retained for compatibility
    public CampusActivity(
            String activityName,
            String description,
            String activityDate,
            String location) {

        this(activityName, "", description, activityDate,
                "", location, "", 0);
    }

    public CampusActivity(
            int id,
            String activityName,
            String description,
            String activityDate,
            String location) {

        this(id, activityName, "", description, activityDate,
                "", location, "", 0);
    }

    public int getId() {
        return id;
    }

    public String getActivityName() {
        return activityName;
    }

    public String getActivityType() {
        return activityType;
    }

    public String getDescription() {
        return description;
    }

    public String getActivityDate() {
        return activityDate;
    }

    public String getActivityTime() {
        return activityTime;
    }

    public String getLocation() {
        return location;
    }

    public String getOrganizer() {
        return organizer;
    }

    public int getCapacity() {
        return capacity;
    }

    public void displayDetails() {
        System.out.println("Activity ID: " + id);
        System.out.println("Activity Name: " + activityName);
        System.out.println("Category: " + activityType);
        System.out.println("Description: " + description);
        System.out.println("Date: " + activityDate);
        System.out.println("Time: " + activityTime);
        System.out.println("Location: " + location);
        System.out.println("Organizer: " + organizer);
        System.out.println("Capacity: " + capacity);
    }
}
