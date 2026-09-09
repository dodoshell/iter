package dev.dodoshell.iter.service;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.domain.RequestEvent;

import java.util.List;

public record RequestConCronologia(Request richiesta, List<RequestEvent> eventi) {
}
