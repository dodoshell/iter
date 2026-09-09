package dev.dodoshell.iter.web;

import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.repository.UserRepository;
import dev.dodoshell.iter.security.CredenzialiNonValideException;
import dev.dodoshell.iter.security.JwtService;
import dev.dodoshell.iter.web.dto.LoginRequest;
import dev.dodoshell.iter.web.dto.LoginResponse;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest richiesta) {
        User user = userRepository.findByEmail(richiesta.email())
                .filter(u -> passwordEncoder.matches(richiesta.password(), u.getPasswordHash()))
                .orElseThrow(CredenzialiNonValideException::new);

        return new LoginResponse(jwtService.generaToken(user));
    }
}
