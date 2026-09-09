package dev.dodoshell.iter.web.dto;

import dev.dodoshell.iter.workflow.Azione;
import jakarta.validation.constraints.NotNull;

public record TransizioneRequest(
        @NotNull Azione azione,
        String motivazione) {
}
