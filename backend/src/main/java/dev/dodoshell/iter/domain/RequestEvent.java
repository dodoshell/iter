package dev.dodoshell.iter.domain;

import dev.dodoshell.iter.workflow.StatoRichiesta;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

// Append-only: una volta creata una riga non viene mai aggiornata né cancellata.
@Entity
@Table(name = "request_events")
public class RequestEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false)
    private Request request;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato_precedente")
    private StatoRichiesta statoPrecedente;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato_nuovo", nullable = false)
    private StatoRichiesta statoNuovo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "autore_id", nullable = false)
    private User autore;

    private String motivazione;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected RequestEvent() {
        // richiesto da JPA
    }

    public RequestEvent(Request request, StatoRichiesta statoPrecedente, StatoRichiesta statoNuovo, User autore, String motivazione) {
        this.request = request;
        this.statoPrecedente = statoPrecedente;
        this.statoNuovo = statoNuovo;
        this.autore = autore;
        this.motivazione = motivazione;
    }

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Request getRequest() {
        return request;
    }

    public StatoRichiesta getStatoPrecedente() {
        return statoPrecedente;
    }

    public StatoRichiesta getStatoNuovo() {
        return statoNuovo;
    }

    public User getAutore() {
        return autore;
    }

    public String getMotivazione() {
        return motivazione;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
