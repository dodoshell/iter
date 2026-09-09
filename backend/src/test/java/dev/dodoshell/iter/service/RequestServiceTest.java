package dev.dodoshell.iter.service;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.domain.RequestEvent;
import dev.dodoshell.iter.domain.Ruolo;
import dev.dodoshell.iter.domain.TipoRichiesta;
import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.repository.RequestEventRepository;
import dev.dodoshell.iter.repository.RequestRepository;
import dev.dodoshell.iter.repository.UserRepository;
import dev.dodoshell.iter.workflow.Azione;
import dev.dodoshell.iter.workflow.RichiestaStateMachine;
import dev.dodoshell.iter.workflow.StatoRichiesta;
import dev.dodoshell.iter.workflow.TransizioneNonConsentitaException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {

    private static final Clock OGGI = Clock.fixed(Instant.parse("2026-09-09T00:00:00Z"), ZoneOffset.UTC);

    @Mock
    private RequestRepository requestRepository;
    @Mock
    private RequestEventRepository requestEventRepository;
    @Mock
    private UserRepository userRepository;

    private RequestService service;

    private User dipendente;
    private User responsabile;
    private User altroResponsabile;
    private User admin;

    @BeforeEach
    void setUp() {
        service = new RequestService(requestRepository, requestEventRepository, userRepository, new RichiestaStateMachine(), OGGI);

        responsabile = utente(2L, Ruolo.RESPONSABILE, null);
        altroResponsabile = utente(3L, Ruolo.RESPONSABILE, null);
        dipendente = utente(1L, Ruolo.DIPENDENTE, responsabile);
        admin = utente(4L, Ruolo.ADMIN, null);
    }

    private static User utente(long id, Ruolo ruolo, User manager) {
        User user = new User("user" + id + "@iter.dev", "hash", "Nome", "Cognome", ruolo, manager);
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }

    private static Request richiesta(long id, User proprietario, StatoRichiesta stato, LocalDate inizio, LocalDate fine) {
        Request request = new Request(proprietario, TipoRichiesta.FERIE, inizio, fine, "nota");
        ReflectionTestUtils.setField(request, "id", id);
        ReflectionTestUtils.setField(request, "stato", stato);
        return request;
    }

    // --- creazione ---

    @Test
    void creaUnaBozzaConDateValide() {
        when(requestRepository.save(any())).thenAnswer(invocazione -> invocazione.getArgument(0));

        Request richiesta = service.creaBozza(dipendente, TipoRichiesta.FERIE,
                LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22), "ferie");

        assertThat(richiesta.getStato()).isEqualTo(StatoRichiesta.BOZZA);
        verify(requestRepository).save(any());
    }

    @Test
    void rifiutaUnaDataFinePrecedenteAllaDataInizio() {
        assertThatThrownBy(() -> service.creaBozza(dipendente, TipoRichiesta.FERIE,
                LocalDate.of(2026, 9, 22), LocalDate.of(2026, 9, 20), null))
                .isInstanceOf(RichiestaNonValidaException.class);
    }

    @Test
    void rifiutaUnaDataInizioNelPassato() {
        assertThatThrownBy(() -> service.creaBozza(dipendente, TipoRichiesta.FERIE,
                LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 2), null))
                .isInstanceOf(RichiestaNonValidaException.class);
    }

    // --- modifica ---

    @Test
    void ilProprietarioModificaUnaPropriaBozza() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        Request risultato = service.modificaBozza(dipendente, 10L, TipoRichiesta.PERMESSO,
                LocalDate.of(2026, 9, 21), LocalDate.of(2026, 9, 21), "aggiornata");

        assertThat(risultato.getTipo()).isEqualTo(TipoRichiesta.PERMESSO);
        assertThat(risultato.getNote()).isEqualTo("aggiornata");
    }

    @Test
    void unUtenteDiversoDalProprietarioNonModificaLaBozza() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThatThrownBy(() -> service.modificaBozza(responsabile, 10L, TipoRichiesta.PERMESSO,
                LocalDate.of(2026, 9, 21), LocalDate.of(2026, 9, 21), null))
                .isInstanceOf(AccessoNonAutorizzatoException.class);
    }

    @Test
    void nonSiPuoModificareUnaRichiestaGiaInviata() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThatThrownBy(() -> service.modificaBozza(dipendente, 10L, TipoRichiesta.PERMESSO,
                LocalDate.of(2026, 9, 21), LocalDate.of(2026, 9, 21), null))
                .isInstanceOf(RichiestaNonValidaException.class);
    }

    @Test
    void modificareUnaRichiestaInesistenteSegnalaNonTrovata() {
        when(requestRepository.findWithUserById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.modificaBozza(dipendente, 99L, TipoRichiesta.FERIE,
                LocalDate.of(2026, 9, 21), LocalDate.of(2026, 9, 21), null))
                .isInstanceOf(RichiestaNonTrovataException.class);
    }

    // --- transizioni ---

    @Test
    void ilProprietarioInviaLaPropriaRichiesta() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));
        when(requestRepository.findSovrapposte(eq(1L), any(), any(), any())).thenReturn(List.of());

        Request risultato = service.applicaTransizione(dipendente, 10L, Azione.INVIA, null);

        assertThat(risultato.getStato()).isEqualTo(StatoRichiesta.INVIATA);
        verify(requestEventRepository).save(argThatEvento(ev ->
                ev.getStatoPrecedente() == StatoRichiesta.BOZZA
                        && ev.getStatoNuovo() == StatoRichiesta.INVIATA
                        && ev.getAutore() == dipendente));
    }

    @Test
    void ilResponsabileDirettoPrendeInCaricoLaRichiesta() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        Request risultato = service.applicaTransizione(responsabile, 10L, Azione.PRENDI_IN_CARICO, null);

        assertThat(risultato.getStato()).isEqualTo(StatoRichiesta.IN_REVISIONE);
    }

    @Test
    void unResponsabileNonDirettoNonPuoAgireSullaRichiesta() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThatThrownBy(() -> service.applicaTransizione(altroResponsabile, 10L, Azione.PRENDI_IN_CARICO, null))
                .isInstanceOf(AccessoNonAutorizzatoException.class);
    }

    @Test
    void ilProprietarioNonPuoApprovareLaPropriaRichiesta() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.IN_REVISIONE, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThatThrownBy(() -> service.applicaTransizione(dipendente, 10L, Azione.APPROVA, null))
                .isInstanceOf(TransizioneNonConsentitaException.class);
    }

    @Test
    void nonSiPuoInviareUnaRichiestaCheSiSovrappone() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        Request giaApprovata = richiesta(11L, dipendente, StatoRichiesta.APPROVATA, LocalDate.of(2026, 9, 21), LocalDate.of(2026, 9, 25));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));
        when(requestRepository.findSovrapposte(eq(1L), any(), any(), any())).thenReturn(List.of(giaApprovata));

        assertThatThrownBy(() -> service.applicaTransizione(dipendente, 10L, Azione.INVIA, null))
                .isInstanceOf(RichiestaNonValidaException.class);

        assertThat(richiesta.getStato()).isEqualTo(StatoRichiesta.BOZZA);
        verify(requestEventRepository, never()).save(any());
    }

    // --- visibilità ---

    @Test
    void ilProprietarioVedeIlDettaglioDellaPropriaRichiesta() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThat(service.dettaglio(dipendente, 10L).richiesta()).isSameAs(richiesta);
    }

    @Test
    void ilManagerDirettoVedeIlDettaglio() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThat(service.dettaglio(responsabile, 10L).richiesta()).isSameAs(richiesta);
    }

    @Test
    void lAdminVedeIlDettaglioDiQualsiasiRichiesta() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThat(service.dettaglio(admin, 10L).richiesta()).isSameAs(richiesta);
    }

    @Test
    void unEstraneoNonVedeIlDettaglio() {
        Request richiesta = richiesta(10L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(richiesta));

        assertThatThrownBy(() -> service.dettaglio(altroResponsabile, 10L))
                .isInstanceOf(AccessoNonAutorizzatoException.class);
    }

    @Test
    void ilManagerDirettoNonVedeUnaBozzaNonAncoraInviata() {
        Request bozza = richiesta(10L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(bozza));

        assertThatThrownBy(() -> service.dettaglio(responsabile, 10L))
                .isInstanceOf(AccessoNonAutorizzatoException.class);
    }

    @Test
    void ilProprietarioVedeComunqueLaPropriaBozza() {
        Request bozza = richiesta(10L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserById(10L)).thenReturn(Optional.of(bozza));

        assertThat(service.dettaglio(dipendente, 10L).richiesta()).isSameAs(bozza);
    }

    // --- liste ---

    @Test
    void unDipendenteVedeSoloLeProprieRichieste() {
        List<Request> proprie = List.of(richiesta(1L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22)));
        when(requestRepository.findWithUserByUserId(1L)).thenReturn(proprie);

        List<Request> risultato = service.lista(dipendente, FiltroRichieste.vuoto());

        assertThat(risultato).isEqualTo(proprie);
    }

    @Test
    void unResponsabileVedeLeRichiesteDeiPropriSottoposti() {
        when(userRepository.findByManagerId(2L)).thenReturn(List.of(dipendente));
        List<Request> deiSottoposti = List.of(richiesta(1L, dipendente, StatoRichiesta.IN_REVISIONE, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22)));
        when(requestRepository.findWithUserByUserIdIn(List.of(1L))).thenReturn(deiSottoposti);

        List<Request> risultato = service.lista(responsabile, FiltroRichieste.vuoto());

        assertThat(risultato).isEqualTo(deiSottoposti);
    }

    @Test
    void unResponsabileNonVedeLeBozzeDeiPropriSottoposti() {
        when(userRepository.findByManagerId(2L)).thenReturn(List.of(dipendente));
        Request bozza = richiesta(1L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        Request inviata = richiesta(2L, dipendente, StatoRichiesta.INVIATA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22));
        when(requestRepository.findWithUserByUserIdIn(List.of(1L))).thenReturn(List.of(bozza, inviata));

        List<Request> risultato = service.lista(responsabile, FiltroRichieste.vuoto());

        assertThat(risultato).containsExactly(inviata);
    }

    @Test
    void unAdminVedeTutteLeRichiesteEPuoFiltrarePerUtenteEStato() {
        Request r1 = richiesta(1L, dipendente, StatoRichiesta.APPROVATA, LocalDate.of(2026, 9, 1), LocalDate.of(2026, 9, 5));
        Request r2 = richiesta(2L, responsabile, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 12));
        when(requestRepository.findAllWithUser()).thenReturn(List.of(r1, r2));

        List<Request> soloApprovate = service.lista(admin, new FiltroRichieste(StatoRichiesta.APPROVATA, null, null, null));
        assertThat(soloApprovate).containsExactly(r1);

        List<Request> soloDelDipendente = service.lista(admin, new FiltroRichieste(null, 1L, null, null));
        assertThat(soloDelDipendente).containsExactly(r1);
    }

    @Test
    void ilFiltroUtenteNonHaEffettoPerUnDipendente() {
        List<Request> proprie = List.of(richiesta(1L, dipendente, StatoRichiesta.BOZZA, LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 22)));
        when(requestRepository.findWithUserByUserId(1L)).thenReturn(proprie);

        List<Request> risultato = service.lista(dipendente, new FiltroRichieste(null, 99L, null, null));

        assertThat(risultato).isEqualTo(proprie);
    }

    private static RequestEvent argThatEvento(Predicate<RequestEvent> predicate) {
        return ArgumentMatchers.argThat(predicate::test);
    }
}
