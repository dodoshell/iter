package dev.dodoshell.iter.security;

import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String PREFISSO_BEARER = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(PREFISSO_BEARER)) {
            autentica(header.substring(PREFISSO_BEARER.length()));
        }

        filterChain.doFilter(request, response);
    }

    private void autentica(String token) {
        try {
            Long userId = jwtService.estraiUserId(token);
            userRepository.findById(userId).ifPresent(this::impostaContestoDiSicurezza);
        } catch (JwtException | IllegalArgumentException ex) {
            // Token mancante, scaduto o manomesso: la richiesta prosegue senza autenticazione.
        }
    }

    private void impostaContestoDiSicurezza(User user) {
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRuolo()));
        var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
