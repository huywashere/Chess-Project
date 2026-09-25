package com.chess.game;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, UUID> {

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.whitePlayer LEFT JOIN FETCH g.blackPlayer ORDER BY g.playedAt DESC")
    List<Game> findRecentGamesWithPlayers(Pageable pageable);

    @Query("SELECT g FROM Game g LEFT JOIN FETCH g.whitePlayer LEFT JOIN FETCH g.blackPlayer WHERE g.whitePlayer.id = :userId OR g.blackPlayer.id = :userId ORDER BY g.playedAt DESC")
    List<Game> findUserGames(UUID userId, Pageable pageable);
}
