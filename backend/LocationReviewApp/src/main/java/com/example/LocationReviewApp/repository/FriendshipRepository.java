package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.Friendship;
import com.example.LocationReviewApp.model.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    // Checks whether any friendship record (in either direction) already exists between two users
    // Used to prevent duplicate requests
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requester.id = :userId1 AND f.receiver.id = :userId2) OR " +
            "(f.requester.id = :userId2 AND f.receiver.id = :userId1)")
    Optional<Friendship> findBetweenUsers(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    // Returns all accepted friendships for a given user (checks both sides of the relationship)
    @Query("SELECT f FROM Friendship f WHERE " +
            "(f.requester.id = :userId OR f.receiver.id = :userId) AND f.status = :status")
    List<Friendship> findByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") FriendshipStatus status);

    // Finds a specific friendship by its ID, but only if the given user is the receiver
    // Used when accepting a request — only the receiver should be allowed to accept
    @Query("SELECT f FROM Friendship f WHERE f.id = :id AND f.receiver.id = :receiverId")
    Optional<Friendship> findByIdAndReceiverId(@Param("id") UUID id, @Param("receiverId") UUID receiverId);
}
