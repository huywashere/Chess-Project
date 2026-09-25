package com.chess.auth;

import com.chess.auth.dto.AuthResponse;
import com.chess.auth.dto.LoginRequest;
import com.chess.auth.dto.RegisterRequest;
import com.chess.auth.dto.UserDto;
import com.chess.user.User;
import com.chess.user.UserRepository;
import com.chess.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Username already exists"));
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists"));
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .eloRating(1200)
                .provider("local")
                .isActive(true)
                .build();

        user = userRepository.save(user);
        userService.evictUserCache(user.getUsername());

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("email", user.getEmail());
        claims.put("role", "ROLE_USER");

        String token = jwtService.generateTokenForUsername(user.getUsername(), claims);

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .eloRating(user.getEloRating())
                .provider(user.getProvider())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(AuthResponse.builder()
                .token(token)
                .user(userDto)
                .message("User registered successfully")
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByIdentifier(request.getIdentifier().trim())
                .orElse(null);

        if (user == null || user.getPasswordHash() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username/email or password"));
        }

        if (!user.getIsActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Account has been deactivated"));
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("email", user.getEmail());
        claims.put("role", "ROLE_USER");

        String token = jwtService.generateTokenForUsername(user.getUsername(), claims);

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .eloRating(user.getEloRating())
                .provider(user.getProvider())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(AuthResponse.builder()
                .token(token)
                .user(userDto)
                .message("Login successful")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }

        String username = auth.getName();
        User user = userService.findByUsername(username)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        UserDto userDto = UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .eloRating(user.getEloRating())
                .provider(user.getProvider())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        return ResponseEntity.ok(Map.of("user", userDto));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
