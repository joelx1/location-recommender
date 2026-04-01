package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    // Returns all reviews for a given location
    List<Review> findByLocationId(UUID locationId);

    // Returns all reviews written by a given user
    List<Review> findByUserId(UUID userId);

    // Returns all reviews written by friends of the given user, newest first
    //
    // A friendship is bidirectional — the user could be either the requester OR the receiver.
    // So we check both directions using two subqueries joined by OR:
    //   Subquery 1: friendships where the user sent the request → get the receiver's reviews
    //   Subquery 2: friendships where the user received the request → get the requester's reviews
    @Query("SELECT r FROM Review r WHERE " +
            "r.user.id IN (SELECT f.receiver.id FROM Friendship f WHERE f.requester.id = :userId AND f.status = :status) " +
            "OR " +
            "r.user.id IN (SELECT f.requester.id FROM Friendship f WHERE f.receiver.id = :userId AND f.status = :status) " +
            "ORDER BY r.createdAt DESC")
    List<Review> findFeedForUser(@Param("userId") UUID userId, @Param("status") FriendshipStatus status);
}