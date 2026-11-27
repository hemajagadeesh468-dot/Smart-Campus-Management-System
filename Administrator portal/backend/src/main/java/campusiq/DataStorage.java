
package campusiq;

public class DataStorage<T> {

    private T data;

    // Store data
    public void setData(T data) {
        this.data = data;
    }

    // Retrieve data
    public T getData() {
        return data;
    }

    public static void main(String[] args) {

        DataStorage<String> studentName = new DataStorage<>();
        studentName.setData("Ananya");

        DataStorage<Integer> studentId = new DataStorage<>();
        studentId.setData(101);

        System.out.println("===== GENERICS DEMONSTRATION =====");
        System.out.println("Student Name: " + studentName.getData());
        System.out.println("Student ID: " + studentId.getData());
    }
}
