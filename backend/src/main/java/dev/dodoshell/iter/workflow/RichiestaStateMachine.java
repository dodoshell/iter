package dev.dodoshell.iter.workflow;

import java.util.EnumMap;
import java.util.Map;

/**
 * Nessuna dipendenza da Spring o dal database: le regole del workflow vivono
 * qui, isolate e testabili da sole.
 */
public class RichiestaStateMachine {

    private record Transizione(StatoRichiesta statoSuccessivo, RuoloAttore ruoloRichiesto, boolean motivazioneObbligatoria) {}

    private static final Map<StatoRichiesta, Map<Azione, Transizione>> TRANSIZIONI = costruisciTransizioni();

    private static Map<StatoRichiesta, Map<Azione, Transizione>> costruisciTransizioni() {
        Map<StatoRichiesta, Map<Azione, Transizione>> tabella = new EnumMap<>(StatoRichiesta.class);

        tabella.put(StatoRichiesta.BOZZA, Map.of(
                Azione.INVIA, new Transizione(StatoRichiesta.INVIATA, RuoloAttore.PROPRIETARIO, false)
        ));

        tabella.put(StatoRichiesta.INVIATA, Map.of(
                Azione.RITIRA, new Transizione(StatoRichiesta.RITIRATA, RuoloAttore.PROPRIETARIO, false),
                Azione.PRENDI_IN_CARICO, new Transizione(StatoRichiesta.IN_REVISIONE, RuoloAttore.RESPONSABILE, false)
        ));

        tabella.put(StatoRichiesta.IN_REVISIONE, Map.of(
                Azione.RITIRA, new Transizione(StatoRichiesta.RITIRATA, RuoloAttore.PROPRIETARIO, false),
                Azione.APPROVA, new Transizione(StatoRichiesta.APPROVATA, RuoloAttore.RESPONSABILE, false),
                Azione.RESPINGI, new Transizione(StatoRichiesta.RESPINTA, RuoloAttore.RESPONSABILE, true)
        ));

        tabella.put(StatoRichiesta.APPROVATA, Map.of());
        tabella.put(StatoRichiesta.RESPINTA, Map.of());
        tabella.put(StatoRichiesta.RITIRATA, Map.of());

        return Map.copyOf(tabella);
    }

    public StatoRichiesta applica(StatoRichiesta statoCorrente, Azione azione, RuoloAttore ruoloAttore, String motivazione) {
        Transizione transizione = TRANSIZIONI.get(statoCorrente).get(azione);
        if (transizione == null) {
            throw new TransizioneNonConsentitaException(
                    "L'azione %s non è consentita dallo stato %s".formatted(azione, statoCorrente));
        }
        if (transizione.ruoloRichiesto() != ruoloAttore) {
            throw new TransizioneNonConsentitaException(
                    "L'azione %s richiede il ruolo %s, non %s".formatted(azione, transizione.ruoloRichiesto(), ruoloAttore));
        }
        if (transizione.motivazioneObbligatoria() && (motivazione == null || motivazione.isBlank())) {
            throw new TransizioneNonConsentitaException(
                    "L'azione %s richiede una motivazione".formatted(azione));
        }
        return transizione.statoSuccessivo();
    }
}
