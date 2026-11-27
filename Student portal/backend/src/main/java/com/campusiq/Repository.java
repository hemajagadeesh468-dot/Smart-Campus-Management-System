package com.campusiq;
import java.util.List;
import java.util.Optional;

/** Generic repository contract demonstrates Java generics and CRUD abstraction. */
public interface Repository<T, ID> {
    ID create(T value) throws Exception;
    List<T> findAll() throws Exception;
    Optional<T> findById(ID id) throws Exception;
    boolean update(ID id, T value) throws Exception;
    boolean delete(ID id) throws Exception;
}
