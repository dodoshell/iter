package dev.dodoshell.iter.web;

public record ErrorResponse(String codice, String messaggio, String campo) {

    public static ErrorResponse of(String codice, String messaggio) {
        return new ErrorResponse(codice, messaggio, null);
    }
}
