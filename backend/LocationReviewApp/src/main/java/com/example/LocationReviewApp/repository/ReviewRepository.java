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

    // Counts total reviews written by a user — used for the cold start check
    long countByUserId(UUID userId);

    // Returns all reviews for a given location
    List<Review> findByLocationId(UUID locationId);

    // Returns all reviews written by a given user
    List<Review> findByUserId(UUID userId);

    // Returns all reviews written by friends of the given user, newest first.
    // Excludes the requesting user's own reviews — a user should not see their
    // own reviews appear in their feed just because a friend added them.
    //
    // A friendship is bidirectional — the user could be either the requester OR the receiver.
    // So we check both directions using two subqueries joined by OR:
    //   Subquery 1: friendships where the user sent the request → get the receiver's reviews
    //   Subquery 2: friendships where the user received the request → get the requester's reviews
    @Query("SELECT r FROM Review r WHERE " +
            "r.user.id != :userId AND (" +
            "r.user.id IN (SELECT f.receiver.id FROM Friendship f WHERE f.requester.id = :userId AND f.status = :status) " +
            "OR " +
            "r.user.id IN (SELECT f.requester.id FROM Friendship f WHERE f.receiver.id = :userId AND f.status = :status)) " +
            "ORDER BY r.createdAt DESC")
    List<Review> findFeedForUser(@Param("userId") UUID userId, @Param("status") FriendshipStatus status);

    // Counts how many of a given user's accepted friends have reviewed a specific location
    // Used by GET /locations/{id}/social-summary to show e.g. "3 of your friends have been here"
    // Checks both directions of the friendship — the user may have been requester or receiver
    @Query("SELECT COUNT(DISTINCT r.user.id) FROM Review r WHERE r.location.id = :locationId AND (" +
            "r.user.id IN (SELECT f.receiver.id FROM Friendship f WHERE f.requester.id = :userId AND f.status = :status) " +
            "OR " +
            "r.user.id IN (SELECT f.requester.id FROM Friendship f WHERE f.receiver.id = :userId AND f.status = :status))")
    long countFriendsReviewedLocation(
            @Param("locationId") UUID locationId,
            @Param("userId") UUID userId,
            @Param("status") FriendshipStatus status);
}