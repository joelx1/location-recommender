package com.example.LocationReviewApp.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// This runs on every single request before it reaches any controller
// It checks the Authorization header for a valid token
// If the token is valid, it tells Spring who is making the request
// If there's no token or it's invalid, the request gets rejected at the next step
// TODO: this whole class gets deleted when we switch to Azure Entra ID

@Component
public class JwtFilter extends OncePerRequestFilter
{
    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil)
    {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException
    {
        String header = request.getHeader("Authorization");

        // Check if the request has a Bearer token in the Authorization header
        if (header != null && header.startsWith("Bearer "))
        {
            String token = header.substring(7); // strip "Bearer " prefix to get the raw token

            if (jwtUtil.isValid(token))
            {
                String username = jwtUtil.extractUsername(token);

                // Tell Spring Security this request is authenticated
                // The empty list means no specific roles yet - we'll add roles later
                var auth = new UsernamePasswordAuthenticationToken(
                        username, null, List.of()
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        // Always continue the chain - SecurityConfig decides what happens next
        chain.doFilter(request, response);
    }
}
