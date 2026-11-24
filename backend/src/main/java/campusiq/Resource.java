package campusiq;

public class Resource {

    private int id;
    private String resourceName;
    private String resourceType;
    private String availability;

    public Resource(int id, String resourceName,
                    String resourceType, String availability) {
        this.id = id;
        this.resourceName = resourceName;
        this.resourceType = resourceType;
        this.availability = availability;
    }

    public int getId() {
        return id;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getAvailability() {
        return availability;
    }

    public void displayDetails() {
        System.out.println("Resource ID: " + id);
        System.out.println("Resource Name: " + resourceName);
        System.out.println("Resource Type: " + resourceType);
        System.out.println("Availability: " + availability);
    }
}