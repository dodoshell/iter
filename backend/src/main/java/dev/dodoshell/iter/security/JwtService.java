package dev.dodoshell.iter.security;

import dev.dodoshell.iter.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey chiave;
    private final Duration validita;

    public JwtService(
            @Value("${iter.jwt.secret}") String secret,
            @Value("${iter.jwt.expiration-hours}") long oreValidita) {
        this.chiave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.validita = Duration.ofHours(oreValidita);
    }

    public String generaToken(User user) {
        Instant ora = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("ruolo", user.getRuolo().name())
                .issuedAt(Date.from(ora))
                .expiration(Date.from(ora.plus(validita)))
                .signWith(chiave)
                .compact();
    }

    public Long estraiUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(chiave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
