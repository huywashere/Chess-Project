package com.chess.rating;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RatingHistoryRepository extends JpaRepository<RatingHistory, UUID> {

    List<RatingHistory> findByUser_IdOrderByCreatedAtDesc(UUID userId);

    List<RatingHistory> findTop30ByUser_IdOrderByCreatedAtDesc(UUID userId);

    long countByUser_Id(UUID userId);

    default List<RatingHistory> findRecentByUserId(UUID userId) {
        return findTop30ByUser_IdOrderByCreatedAtDesc(userId);
    }
}
