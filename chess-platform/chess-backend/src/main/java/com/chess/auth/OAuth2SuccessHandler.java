package com.chess.auth;

import com.chess.user.User;
import com.chess.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

        if (email == null) {
            getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/login?error=OAuth2EmailNotFound");
            return;
        }

        // Find existing or register new user
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            String baseUsername = (name != null ? name.replaceAll("\\s+", "").toLowerCase() : "user");
            if (baseUsername.length() > 20) {
                baseUsername = baseUsername.substring(0, 20);
            }
            String candidateUsername = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsername(candidateUsername)) {
                candidateUsername = baseUsername + counter++;
            }

            return userRepository.save(User.builder()
                    .username(candidateUsername)
                    .email(email)
                    .avatarUrl(avatar)
                    .provider("google")
                    .providerId(googleId)
                    .eloRating(1200)
                    .isActive(true)
                    .build());
        });

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());
        claims.put("email", user.getEmail());
        claims.put("role", "ROLE_USER");

        String token = jwtService.generateTokenForUsername(user.getUsername(), claims);

        String targetUrl = frontendUrl + "/login?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
