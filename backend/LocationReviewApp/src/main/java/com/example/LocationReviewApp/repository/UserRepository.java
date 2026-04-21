package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Spring reads this method name and generates: SELECT * FROM users WHERE azure_oid = ?
    // You never write the SQL yourself.
    Optional<User> findByAzureOid(String azureOid);
}