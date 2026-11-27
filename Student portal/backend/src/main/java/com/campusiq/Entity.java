package com.campusiq;
import java.util.Map;

/** Base class representing a real campus entity. */
public abstract class Entity {
    protected final String entityType;
    protected final Map<String,Object> fields;
    protected Entity(String entityType, Map<String,Object> fields) { this.entityType=entityType; this.fields=fields; }
    public String getEntityType(){ return entityType; }
    public Map<String,Object> getFields(){ return fields; }
    public abstract String displayLabel();
}
