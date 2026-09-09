package dev.dodoshell.iter.service;

import dev.dodoshell.iter.workflow.StatoRichiesta;

import java.time.LocalDate;

// userId, dataDa e dataA hanno effetto solo per un attore ADMIN: dipendenti e
// responsabili vedono comunque soltanto le richieste per cui sono autorizzati.
public record FiltroRichieste(StatoRichiesta stato, Long userId, LocalDate dataDa, LocalDate dataA) {

    public static FiltroRichieste vuoto() {
        return new FiltroRichieste(null, null, null, null);
    }
}
