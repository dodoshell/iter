package dev.dodoshell.iter.web;

import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.web.dto.MeResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal User currentUser) {
        return MeResponse.from(currentUser);
    }
}
