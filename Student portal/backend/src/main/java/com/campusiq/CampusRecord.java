package com.campusiq;
import java.util.Map;

/** Polymorphic campus record used for students, faculty, courses and activities. */
public class CampusRecord extends Entity {
    public CampusRecord(String type, Map<String,Object> fields) { super(type, fields); }
    @Override public String displayLabel() {
        Object label=fields.getOrDefault("name", fields.getOrDefault("title", fields.getOrDefault("subject", "Campus record")));
        return String.valueOf(label);
    }
}
