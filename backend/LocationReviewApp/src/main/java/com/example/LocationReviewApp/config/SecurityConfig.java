package com.example.LocationReviewApp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    // The issuer URI from application.properties — Spring uses this to auto-discover the JWK keys
    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    // The backend app's client ID — every token must be issued for this specific app
    @Value("${azure.entra.client-id}")
    private String backendClientId;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // No CSRF needed — stateless JWT API, no browser sessions
            .csrf(csrf -> csrf.disable())

            // No sessions — every request stands alone and is verified by its token
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // CORS — open for development (restrict before production)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Every request must have a valid JWT — no token = 401
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())

            // Tell Spring to look for JWT Bearer tokens and use our custom decoder
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // JwtDecoders.fromIssuerLocation() fetches the OIDC discovery document from the
        // issuer URI and auto-discovers the JWK keys endpoint. Spring downloads the public
        // keys from there on startup and uses them to verify every token signature.
        NimbusJwtDecoder decoder = JwtDecoders.fromIssuerLocation(issuerUri);

        // Add one extra check: the token's audience must match our backend client ID.
        // This ensures tokens issued for other apps in the same tenant are rejected.
        decoder.setJwtValidator(token -> {
            if (token.getAudience().contains(backendClientId)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                new OAuth2Error("invalid_token", "Token was not issued for this API", null)
            );
        });

        return decoder;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
