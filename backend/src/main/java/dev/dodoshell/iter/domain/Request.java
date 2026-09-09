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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "requests")
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoRichiesta tipo;

    @Column(name = "data_inizio", nullable = false)
    private LocalDate dataInizio;

    @Column(name = "data_fine", nullable = false)
    private LocalDate dataFine;

    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatoRichiesta stato;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Request() {
        // richiesto da JPA
    }

    public Request(User user, TipoRichiesta tipo, LocalDate dataInizio, LocalDate dataFine, String note) {
        this.user = user;
        this.tipo = tipo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.note = note;
        this.stato = StatoRichiesta.BOZZA;
    }

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public void modifica(TipoRichiesta tipo, LocalDate dataInizio, LocalDate dataFine, String note) {
        this.tipo = tipo;
        this.dataInizio = dataInizio;
        this.dataFine = dataFine;
        this.note = note;
    }

    public void cambiaStato(StatoRichiesta nuovoStato) {
        this.stato = nuovoStato;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public TipoRichiesta getTipo() {
        return tipo;
    }

    public LocalDate getDataInizio() {
        return dataInizio;
    }

    public LocalDate getDataFine() {
        return dataFine;
    }

    public String getNote() {
        return note;
    }

    public StatoRichiesta getStato() {
        return stato;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
