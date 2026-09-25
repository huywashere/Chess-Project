package com.chess.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 30)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "elo_rating", nullable = false)
    @Builder.Default
    private Integer eloRating = 1200;

    @Column(length = 10)
    private String title; // "GM", "IM", "FM"

    @Column(length = 10)
    private String country; // "VN", "US", etc.

    @Column(length = 20)
    @Builder.Default
    private String role = "USER";

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String provider = "local"; // "local" | "google"

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
