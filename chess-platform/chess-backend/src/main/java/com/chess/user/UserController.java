package com.chess.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfileDto implements Serializable {
        private static final long serialVersionUID = 1L;

        private UUID id;
        private String username;
        private String avatarUrl;
        private Integer eloRating;
        private String title;
        private String country;
        private String role;
        private Instant createdAt;
    }

    @Data
    public static class UpdateProfileRequest {
        private String avatarUrl;
        private String title;
        private String country;
    }

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        return userService.findByUsername(username)
                .map(u -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", UserProfileDto.builder()
                                .id(u.getId())
                                .username(u.getUsername())
                                .avatarUrl(u.getAvatarUrl())
                                .eloRating(u.getEloRating())
                                .title(u.getTitle())
                                .country(u.getCountry())
                                .role(u.getRole())
                                .createdAt(u.getCreatedAt())
                                .build()
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found")));
    }

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl().trim());
        if (request.getTitle() != null) user.setTitle(request.getTitle().trim());
        if (request.getCountry() != null) user.setCountry(request.getCountry().trim().toUpperCase());

        user = userRepository.save(user);

        // Evict cached user profile & user details in Redis
        userService.evictUserCache(username);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "data", UserProfileDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .avatarUrl(user.getAvatarUrl())
                        .eloRating(user.getEloRating())
                        .title(user.getTitle())
                        .country(user.getCountry())
                        .role(user.getRole())
                        .createdAt(user.getCreatedAt())
                        .build()
        ));
    }
}
