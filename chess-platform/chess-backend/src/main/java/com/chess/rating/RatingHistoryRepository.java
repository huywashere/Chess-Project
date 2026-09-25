package com.chess.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RatingHistoryRepository extends JpaRepository<RatingHistory, UUID> {

    @Query("SELECT r FROM RatingHistory r WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<RatingHistory> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT r FROM RatingHistory r WHERE r.user.id = :userId ORDER BY r.createdAt DESC LIMIT 30")
    List<RatingHistory> findRecentByUserId(UUID userId);
}
