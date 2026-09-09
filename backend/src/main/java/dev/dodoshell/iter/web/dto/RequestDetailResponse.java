package dev.dodoshell.iter.web.dto;

import dev.dodoshell.iter.service.RequestConCronologia;

import java.util.List;

public record RequestDetailResponse(RequestResponse richiesta, List<RequestEventResponse> cronologia) {

    public static RequestDetailResponse from(RequestConCronologia richiestaConCronologia) {
        return new RequestDetailResponse(
                RequestResponse.from(richiestaConCronologia.richiesta()),
                richiestaConCronologia.eventi().stream().map(RequestEventResponse::from).toList());
    }
}
