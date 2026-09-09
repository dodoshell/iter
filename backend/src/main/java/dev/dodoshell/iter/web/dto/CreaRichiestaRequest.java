package dev.dodoshell.iter.web.dto;

import dev.dodoshell.iter.domain.TipoRichiesta;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreaRichiestaRequest(
        @NotNull TipoRichiesta tipo,
        @NotNull LocalDate dataInizio,
        @NotNull LocalDate dataFine,
        String note) {
}
