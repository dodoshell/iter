package dev.dodoshell.iter.web.dto;

import dev.dodoshell.iter.domain.Ruolo;
import dev.dodoshell.iter.domain.User;

public record MeResponse(Long id, String email, String nome, String cognome, Ruolo ruolo, Long managerId) {

    public static MeResponse from(User user) {
        Long managerId = user.getManager() != null ? user.getManager().getId() : null;
        return new MeResponse(user.getId(), user.getEmail(), user.getNome(), user.getCognome(), user.getRuolo(), managerId);
    }
}
