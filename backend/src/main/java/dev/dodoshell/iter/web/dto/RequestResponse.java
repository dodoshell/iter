package dev.dodoshell.iter.web.dto;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.domain.TipoRichiesta;
import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.workflow.StatoRichiesta;

import java.time.Instant;
import java.time.LocalDate;

public record RequestResponse(
        Long id,
        Long userId,
        String userNomeCompleto,
        TipoRichiesta tipo,
        LocalDate dataInizio,
        LocalDate dataFine,
        String note,
        StatoRichiesta stato,
        Instant createdAt,
        Instant updatedAt) {

    public static RequestResponse from(Request richiesta) {
        User proprietario = richiesta.getUser();
        return new RequestResponse(
                richiesta.getId(),
                proprietario.getId(),
                proprietario.getNome() + " " + proprietario.getCognome(),
                richiesta.getTipo(),
                richiesta.getDataInizio(),
                richiesta.getDataFine(),
                richiesta.getNote(),
                richiesta.getStato(),
                richiesta.getCreatedAt(),
                richiesta.getUpdatedAt());
    }
}
