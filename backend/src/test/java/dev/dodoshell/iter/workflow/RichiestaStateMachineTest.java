package dev.dodoshell.iter.workflow;

import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RichiestaStateMachineTest {

    private final RichiestaStateMachine machine = new RichiestaStateMachine();

    private record CasoValido(StatoRichiesta partenza, Azione azione, RuoloAttore ruolo, String motivazione, StatoRichiesta arrivo) {}

    private static final List<CasoValido> CASI_VALIDI = List.of(
            new CasoValido(StatoRichiesta.BOZZA, Azione.INVIA, RuoloAttore.PROPRIETARIO, null, StatoRichiesta.INVIATA),
            new CasoValido(StatoRichiesta.INVIATA, Azione.RITIRA, RuoloAttore.PROPRIETARIO, null, StatoRichiesta.RITIRATA),
            new CasoValido(StatoRichiesta.INVIATA, Azione.PRENDI_IN_CARICO, RuoloAttore.RESPONSABILE, null, StatoRichiesta.IN_REVISIONE),
            new CasoValido(StatoRichiesta.IN_REVISIONE, Azione.RITIRA, RuoloAttore.PROPRIETARIO, null, StatoRichiesta.RITIRATA),
            new CasoValido(StatoRichiesta.IN_REVISIONE, Azione.APPROVA, RuoloAttore.RESPONSABILE, null, StatoRichiesta.APPROVATA),
            new CasoValido(StatoRichiesta.IN_REVISIONE, Azione.RESPINGI, RuoloAttore.RESPONSABILE, "Periodo con copertura insufficiente", StatoRichiesta.RESPINTA)
    );

    @ParameterizedTest
    @MethodSource("casiValidi")
    void applicaLaTransizioneQuandoAmmessa(CasoValido caso) {
        StatoRichiesta risultato = machine.applica(caso.partenza(), caso.azione(), caso.ruolo(), caso.motivazione());

        assertThat(risultato).isEqualTo(caso.arrivo());
    }

    private static Stream<CasoValido> casiValidi() {
        return CASI_VALIDI.stream();
    }

    @TestFactory
    Stream<DynamicTest> rifiutaOgniAzioneNonPrevistaDalloStatoCorrente() {
        return combinazioniNonAmmesse().stream()
                .map(caso -> DynamicTest.dynamicTest(
                        "%s + %s non è ammessa".formatted(caso.partenza(), caso.azione()),
                        () -> assertThatThrownBy(() ->
                                machine.applica(caso.partenza(), caso.azione(), RuoloAttore.PROPRIETARIO, "motivazione"))
                                .isInstanceOf(TransizioneNonConsentitaException.class)));
    }

    private static List<CasoValido> combinazioniNonAmmesse() {
        List<CasoValido> nonAmmesse = new ArrayList<>();
        for (StatoRichiesta stato : StatoRichiesta.values()) {
            for (Azione azione : EnumSet.allOf(Azione.class)) {
                boolean ammessa = CASI_VALIDI.stream()
                        .anyMatch(c -> c.partenza() == stato && c.azione() == azione);
                if (!ammessa) {
                    nonAmmesse.add(new CasoValido(stato, azione, null, null, null));
                }
            }
        }
        return nonAmmesse;
    }

    @ParameterizedTest
    @MethodSource("casiValidi")
    void rifiutaUnaTransizioneAmmessaSeIlRuoloNonCorrisponde(CasoValido caso) {
        RuoloAttore ruoloSbagliato = caso.ruolo() == RuoloAttore.PROPRIETARIO
                ? RuoloAttore.RESPONSABILE
                : RuoloAttore.PROPRIETARIO;

        assertThatThrownBy(() -> machine.applica(caso.partenza(), caso.azione(), ruoloSbagliato, caso.motivazione()))
                .isInstanceOf(TransizioneNonConsentitaException.class);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {"   "})
    void respingiRichiedeUnaMotivazioneNonVuota(String motivazione) {
        assertThatThrownBy(() ->
                machine.applica(StatoRichiesta.IN_REVISIONE, Azione.RESPINGI, RuoloAttore.RESPONSABILE, motivazione))
                .isInstanceOf(TransizioneNonConsentitaException.class);
    }

    @Test
    void nessunaAzioneEAmmessaDaUnoStatoFinale() {
        for (StatoRichiesta statoFinale : List.of(StatoRichiesta.APPROVATA, StatoRichiesta.RESPINTA, StatoRichiesta.RITIRATA)) {
            for (Azione azione : Azione.values()) {
                assertThatThrownBy(() -> machine.applica(statoFinale, azione, RuoloAttore.PROPRIETARIO, "x"))
                        .isInstanceOf(TransizioneNonConsentitaException.class);
                assertThatThrownBy(() -> machine.applica(statoFinale, azione, RuoloAttore.RESPONSABILE, "x"))
                        .isInstanceOf(TransizioneNonConsentitaException.class);
            }
        }
    }
}
