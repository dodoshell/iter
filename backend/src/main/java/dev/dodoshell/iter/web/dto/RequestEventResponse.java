package dev.dodoshell.iter.web.dto;

import dev.dodoshell.iter.domain.RequestEvent;
import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.workflow.StatoRichiesta;

import java.time.Instant;

public record RequestEventResponse(
        Long id,
        StatoRichiesta statoPrecedente,
        StatoRichiesta statoNuovo,
        Long autoreId,
        String autoreNomeCompleto,
        String motivazione,
        Instant createdAt) {

    public static RequestEventResponse from(RequestEvent evento) {
        User autore = evento.getAutore();
        return new RequestEventResponse(
                evento.getId(),
                evento.getStatoPrecedente(),
                evento.getStatoNuovo(),
                autore.getId(),
                autore.getNome() + " " + autore.getCognome(),
                evento.getMotivazione(),
                evento.getCreatedAt());
    }
}
