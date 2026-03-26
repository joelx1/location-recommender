package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>
{
    // Lets us look up a user by their username
    // Spring Data automatically writes the SQL for this based on the method name
    // Used by AuthController to check if a username exists before issuing a token
    Optional<User> findByUsername(String username);
}