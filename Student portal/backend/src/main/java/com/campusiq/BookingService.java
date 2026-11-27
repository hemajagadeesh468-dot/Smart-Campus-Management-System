package com.campusiq;
import java.util.*;

/** Interface-based booking contract. Synchronized booking prevents simultaneous double booking. */
public class BookingService {
    public interface AvailabilityPolicy { boolean isAvailable(String resource, String slot); }
    private final Set<String> bookedSlots = Collections.synchronizedSet(new HashSet<>());
    private final AvailabilityPolicy policy;
    public BookingService(AvailabilityPolicy policy){ this.policy=policy; }
    public synchronized Map<String,Object> book(String resource, String slot, String studentId) {
        String key=resource.trim().toLowerCase()+"|"+slot.trim().toLowerCase();
        if(resource.isBlank() || slot.isBlank()) throw new IllegalArgumentException("Resource and slot are required.");
        if(!policy.isAvailable(resource,slot) || bookedSlots.contains(key)) throw new IllegalStateException("This resource is already booked for the selected slot.");
        bookedSlots.add(key);
        return Map.of("resource",resource,"slot",slot,"studentId",studentId,"status","CONFIRMED");
    }
    public synchronized boolean cancel(String resource,String slot){ return bookedSlots.remove(resource.trim().toLowerCase()+"|"+slot.trim().toLowerCase()); }
}
