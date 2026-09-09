package dev.dodoshell.iter.service;

public class RichiestaNonTrovataException extends RuntimeException {

    public RichiestaNonTrovataException(Long id) {
        super("Richiesta " + id + " non trovata");
    }
}
