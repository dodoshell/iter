package dev.dodoshell.iter.web;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.service.FiltroRichieste;
import dev.dodoshell.iter.service.RequestService;
import dev.dodoshell.iter.web.dto.CreaRichiestaRequest;
import dev.dodoshell.iter.web.dto.ModificaRichiestaRequest;
import dev.dodoshell.iter.web.dto.RequestDetailResponse;
import dev.dodoshell.iter.web.dto.RequestResponse;
import dev.dodoshell.iter.web.dto.TransizioneRequest;
import dev.dodoshell.iter.workflow.StatoRichiesta;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestController {

    private final RequestService requestService;

    public RequestController(RequestService requestService) {
        this.requestService = requestService;
    }

    @GetMapping
    public List<RequestResponse> lista(
            @AuthenticationPrincipal User attore,
            @RequestParam(required = false) StatoRichiesta stato,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataDa,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataA) {
        FiltroRichieste filtro = new FiltroRichieste(stato, userId, dataDa, dataA);
        return requestService.lista(attore, filtro).stream().map(RequestResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RequestResponse crea(@AuthenticationPrincipal User attore, @Valid @RequestBody CreaRichiestaRequest body) {
        Request richiesta = requestService.creaBozza(attore, body.tipo(), body.dataInizio(), body.dataFine(), body.note());
        return RequestResponse.from(richiesta);
    }

    @GetMapping("/{id}")
    public RequestDetailResponse dettaglio(@AuthenticationPrincipal User attore, @PathVariable Long id) {
        return RequestDetailResponse.from(requestService.dettaglio(attore, id));
    }

    @PatchMapping("/{id}")
    public RequestResponse modifica(
            @AuthenticationPrincipal User attore,
            @PathVariable Long id,
            @Valid @RequestBody ModificaRichiestaRequest body) {
        Request richiesta = requestService.modificaBozza(attore, id, body.tipo(), body.dataInizio(), body.dataFine(), body.note());
        return RequestResponse.from(richiesta);
    }

    @PostMapping("/{id}/transitions")
    public RequestResponse transizione(
            @AuthenticationPrincipal User attore,
            @PathVariable Long id,
            @Valid @RequestBody TransizioneRequest body) {
        Request richiesta = requestService.applicaTransizione(attore, id, body.azione(), body.motivazione());
        return RequestResponse.from(richiesta);
    }
}
