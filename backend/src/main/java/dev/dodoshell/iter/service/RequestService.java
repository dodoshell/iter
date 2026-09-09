package dev.dodoshell.iter.service;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.domain.Ruolo;
import dev.dodoshell.iter.domain.TipoRichiesta;
import dev.dodoshell.iter.domain.User;
import dev.dodoshell.iter.repository.RequestEventRepository;
import dev.dodoshell.iter.repository.RequestRepository;
import dev.dodoshell.iter.repository.UserRepository;
import dev.dodoshell.iter.domain.RequestEvent;
import dev.dodoshell.iter.workflow.Azione;
import dev.dodoshell.iter.workflow.RichiestaStateMachine;
import dev.dodoshell.iter.workflow.RuoloAttore;
import dev.dodoshell.iter.workflow.StatoRichiesta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final RequestEventRepository requestEventRepository;
    private final UserRepository userRepository;
    private final RichiestaStateMachine stateMachine;
    private final Clock clock;

    public RequestService(
            RequestRepository requestRepository,
            RequestEventRepository requestEventRepository,
            UserRepository userRepository,
            RichiestaStateMachine stateMachine,
            Clock clock) {
        this.requestRepository = requestRepository;
        this.requestEventRepository = requestEventRepository;
        this.userRepository = userRepository;
        this.stateMachine = stateMachine;
        this.clock = clock;
    }

    @Transactional
    public Request creaBozza(User dipendente, TipoRichiesta tipo, LocalDate dataInizio, LocalDate dataFine, String note) {
        validaDate(dataInizio, dataFine);
        Request richiesta = new Request(dipendente, tipo, dataInizio, dataFine, note);
        return requestRepository.save(richiesta);
    }

    @Transactional
    public Request modificaBozza(User attore, Long requestId, TipoRichiesta tipo, LocalDate dataInizio, LocalDate dataFine, String note) {
        Request richiesta = getRichiestaOrThrow(requestId);
        assicuraProprietario(attore, richiesta);

        if (richiesta.getStato() != StatoRichiesta.BOZZA) {
            throw new RichiestaNonValidaException("Una richiesta si può modificare solo mentre è in bozza");
        }

        validaDate(dataInizio, dataFine);
        richiesta.modifica(tipo, dataInizio, dataFine, note);
        return richiesta;
    }

    @Transactional
    public Request applicaTransizione(User attore, Long requestId, Azione azione, String motivazione) {
        Request richiesta = getRichiestaOrThrow(requestId);
        RuoloAttore ruoloAttore = determinaRuoloAttore(attore, richiesta);

        if (azione == Azione.INVIA) {
            validaSovrapposizione(richiesta);
        }

        StatoRichiesta statoPrecedente = richiesta.getStato();
        StatoRichiesta statoNuovo = stateMachine.applica(statoPrecedente, azione, ruoloAttore, motivazione);

        richiesta.cambiaStato(statoNuovo);
        requestEventRepository.save(new RequestEvent(richiesta, statoPrecedente, statoNuovo, attore, motivazione));

        return richiesta;
    }

    public RequestConCronologia dettaglio(User attore, Long requestId) {
        Request richiesta = getRichiestaOrThrow(requestId);
        assicuraVisibile(attore, richiesta);
        List<RequestEvent> eventi = requestEventRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
        return new RequestConCronologia(richiesta, eventi);
    }

    public List<Request> lista(User attore, FiltroRichieste filtro) {
        List<Request> risultato = switch (attore.getRuolo()) {
            case DIPENDENTE -> requestRepository.findByUserId(attore.getId());
            case RESPONSABILE -> requestRepository.findByUserIdIn(idSottoposti(attore));
            case ADMIN -> requestRepository.findAll();
        };

        return risultato.stream()
                .filter(r -> filtro.stato() == null || r.getStato() == filtro.stato())
                .filter(r -> attore.getRuolo() != Ruolo.ADMIN || filtro.userId() == null || r.getUser().getId().equals(filtro.userId()))
                .filter(r -> attore.getRuolo() != Ruolo.ADMIN || filtro.dataDa() == null || !r.getDataFine().isBefore(filtro.dataDa()))
                .filter(r -> attore.getRuolo() != Ruolo.ADMIN || filtro.dataA() == null || !r.getDataInizio().isAfter(filtro.dataA()))
                .toList();
    }

    private List<Long> idSottoposti(User responsabile) {
        return userRepository.findByManagerId(responsabile.getId()).stream().map(User::getId).toList();
    }

    private RuoloAttore determinaRuoloAttore(User attore, Request richiesta) {
        if (attore.getId().equals(richiesta.getUser().getId())) {
            return RuoloAttore.PROPRIETARIO;
        }
        User managerProprietario = richiesta.getUser().getManager();
        if (managerProprietario != null && managerProprietario.getId().equals(attore.getId())) {
            return RuoloAttore.RESPONSABILE;
        }
        throw new AccessoNonAutorizzatoException("Non sei autorizzato ad agire su questa richiesta");
    }

    private void assicuraProprietario(User attore, Request richiesta) {
        if (!attore.getId().equals(richiesta.getUser().getId())) {
            throw new AccessoNonAutorizzatoException("Non sei il proprietario di questa richiesta");
        }
    }

    private void assicuraVisibile(User attore, Request richiesta) {
        boolean proprietario = attore.getId().equals(richiesta.getUser().getId());
        User managerProprietario = richiesta.getUser().getManager();
        boolean managerDiretto = managerProprietario != null && managerProprietario.getId().equals(attore.getId());
        boolean admin = attore.getRuolo() == Ruolo.ADMIN;

        if (!proprietario && !managerDiretto && !admin) {
            throw new AccessoNonAutorizzatoException("Non sei autorizzato a vedere questa richiesta");
        }
    }

    private void validaDate(LocalDate dataInizio, LocalDate dataFine) {
        if (dataFine.isBefore(dataInizio)) {
            throw new RichiestaNonValidaException("La data di fine deve essere successiva o uguale alla data di inizio");
        }
        if (dataInizio.isBefore(LocalDate.now(clock))) {
            throw new RichiestaNonValidaException("Non è possibile creare una richiesta con date nel passato");
        }
    }

    private void validaSovrapposizione(Request richiesta) {
        List<Request> sovrapposte = requestRepository.findSovrapposte(
                richiesta.getUser().getId(),
                List.of(StatoRichiesta.APPROVATA, StatoRichiesta.IN_REVISIONE),
                richiesta.getDataInizio(),
                richiesta.getDataFine());

        boolean sovrapponeAltra = sovrapposte.stream().anyMatch(r -> !r.getId().equals(richiesta.getId()));
        if (sovrapponeAltra) {
            throw new RichiestaNonValidaException("Il periodo si sovrappone a un'altra richiesta già approvata o in valutazione");
        }
    }

    private Request getRichiestaOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new RichiestaNonTrovataException(id));
    }
}
