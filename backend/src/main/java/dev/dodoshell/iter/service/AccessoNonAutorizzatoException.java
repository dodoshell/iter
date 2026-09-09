package dev.dodoshell.iter.service;

public class AccessoNonAutorizzatoException extends RuntimeException {

    public AccessoNonAutorizzatoException(String message) {
        super(message);
    }
}
