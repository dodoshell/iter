package dev.dodoshell.iter.web;

import dev.dodoshell.iter.security.CredenzialiNonValideException;
import dev.dodoshell.iter.service.AccessoNonAutorizzatoException;
import dev.dodoshell.iter.service.RichiestaNonTrovataException;
import dev.dodoshell.iter.service.RichiestaNonValidaException;
import dev.dodoshell.iter.workflow.TransizioneNonConsentitaException;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RichiestaNonTrovataException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse richiestaNonTrovata(RichiestaNonTrovataException ex) {
        return ErrorResponse.of("RICHIESTA_NON_TROVATA", ex.getMessage());
    }

    @ExceptionHandler(AccessoNonAutorizzatoException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse accessoNonAutorizzato(AccessoNonAutorizzatoException ex) {
        return ErrorResponse.of("ACCESSO_NON_AUTORIZZATO", ex.getMessage());
    }

    @ExceptionHandler(RichiestaNonValidaException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse richiestaNonValida(RichiestaNonValidaException ex) {
        return ErrorResponse.of("RICHIESTA_NON_VALIDA", ex.getMessage());
    }

    @ExceptionHandler(TransizioneNonConsentitaException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse transizioneNonConsentita(TransizioneNonConsentitaException ex) {
        return ErrorResponse.of("TRANSIZIONE_NON_CONSENTITA", ex.getMessage());
    }

    @ExceptionHandler(CredenzialiNonValideException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse credenzialiNonValide(CredenzialiNonValideException ex) {
        return ErrorResponse.of("CREDENZIALI_NON_VALIDE", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse validazioneFallita(MethodArgumentNotValidException ex) {
        FieldError primoErrore = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        if (primoErrore == null) {
            return ErrorResponse.of("DATI_NON_VALIDI", "Dati non validi");
        }
        return new ErrorResponse("DATI_NON_VALIDI", primoErrore.getDefaultMessage(), primoErrore.getField());
    }
}
