package com.example.LocationReviewApp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private static final String FIREBASE_PROJECT_ID = "placemark-ffb41";
    private static final String FIREBASE_ISSUER = "https://securetoken.google.com/" + FIREBASE_PROJECT_ID;
    private static final String FIREBASE_ISSUER_PREFIX = "https://securetoken.google.com/";
    private static final String FIREBASE_JWK_URI = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:}")
    private String issuerUri;

    @Value("${azure.entra.client-id:}")
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
        // Firebase decoder — Firebase doesn't publish an OIDC discovery doc so we point
        // directly at the JWK URI rather than using fromIssuerLocation().
        NimbusJwtDecoder firebaseDecoder = NimbusJwtDecoder.withJwkSetUri(FIREBASE_JWK_URI).build();
        OAuth2TokenValidator<Jwt> firebaseIssuerValidator = JwtValidators.createDefaultWithIssuer(FIREBASE_ISSUER);
        OAuth2TokenValidator<Jwt> firebaseAudienceValidator = token ->
            token.getAudience().contains(FIREBASE_PROJECT_ID)
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Token audience does not match Firebase project", null));
        firebaseDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(firebaseIssuerValidator, firebaseAudienceValidator));

        // Azure decoder — only built when the issuer URI is configured.
        NimbusJwtDecoder azureDecoder = null;
        if (issuerUri != null && !issuerUri.isBlank()) {
            azureDecoder = JwtDecoders.fromIssuerLocation(issuerUri);
            OAuth2TokenValidator<Jwt> azureDefaultValidators = JwtValidators.createDefaultWithIssuer(issuerUri);
            OAuth2TokenValidator<Jwt> azureAudienceValidator = token ->
                token.getAudience().contains(backendClientId)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Token was not issued for this API", null));
            azureDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(azureDefaultValidators, azureAudienceValidator));
        }

        final NimbusJwtDecoder finalAzureDecoder = azureDecoder;

        // Peek at the raw token's issuer claim (without verifying the signature) to route
        // to the correct decoder. JWTParser is safe here — verification happens inside
        // whichever decoder we delegate to.
        return token -> {
            try {
                String issuer = com.nimbusds.jwt.JWTParser.parse(token).getJWTClaimsSet().getIssuer();
                if (issuer != null && issuer.startsWith(FIREBASE_ISSUER_PREFIX)) {
                    return firebaseDecoder.decode(token);
                }
            } catch (Exception ignored) {}
            if (finalAzureDecoder == null) {
                throw new org.springframework.security.oauth2.jwt.BadJwtException("Azure auth is not configured on this server");
            }
            return finalAzureDecoder.decode(token);
        };
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
