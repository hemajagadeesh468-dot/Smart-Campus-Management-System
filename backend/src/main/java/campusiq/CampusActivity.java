
package campusiq;

public class CampusActivity {

    private int id;
    private String activityName;
    private String description;
    private String activityDate;
    private String location;

    // Constructor for adding a new activity
    public CampusActivity(String activityName, String description,
                          String activityDate, String location) {
        this.activityName = activityName;
        this.description = description;
        this.activityDate = activityDate;
        this.location = location;
    }

    // Constructor for retrieving an existing activity
    public CampusActivity(int id, String activityName, String description,
                          String activityDate, String location) {
        this.id = id;
        this.activityName = activityName;
        this.description = description;
        this.activityDate = activityDate;
        this.location = location;
    }

    public int getId() {
        return id;
    }

    public String getActivityName() {
        return activityName;
    }

    public String getDescription() {
        return description;
    }

    public String getActivityDate() {
        return activityDate;
    }

    public String getLocation() {
        return location;
    }

    public void displayDetails() {
        System.out.println("Activity ID: " + id);
        System.out.println("Activity Name: " + activityName);
        System.out.println("Description: " + description);
        System.out.println("Date: " + activityDate);
        System.out.println("Location: " + location);
    }
}
