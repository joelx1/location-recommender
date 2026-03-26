package com.example.LocationReviewApp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// This is the rules board for our entire API
// It decides which endpoints are public and which ones need a token
// TODO: when we switch to Azure Entra ID, replace the JwtFilter line with
// .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {})) and delete the rest
@Configuration
public class SecurityConfig
{
    private final JwtFilter jwtFilter;

    // Spring automatically injects our JwtFilter here
    public SecurityConfig(JwtFilter jwtFilter)
    {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception
    {
        http
            // Disable CSRF - not needed for a stateless REST API using tokens
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // /auth/login is the only public endpoint - you need it to get a token in the first place
                .requestMatchers("/auth/**").permitAll()
                // Every other endpoint requires a valid token
                .anyRequest().authenticated()
            )

            // Register our JwtFilter so it runs before every request
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}