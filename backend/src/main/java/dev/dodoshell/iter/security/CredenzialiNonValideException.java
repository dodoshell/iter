package dev.dodoshell.iter.security;

public class CredenzialiNonValideException extends RuntimeException {

    public CredenzialiNonValideException() {
        super("Email o password non corrette");
    }
}
