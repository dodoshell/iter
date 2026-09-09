package dev.dodoshell.iter.repository;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.workflow.StatoRichiesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RequestRepository extends JpaRepository<Request, Long> {

    // Con spring.jpa.open-in-view=false la sessione Hibernate si chiude alla fine
    // della transazione del service: senza JOIN FETCH, richiesta.getUser().getNome()
    // fallirebbe con LazyInitializationException quando il controller costruisce la
    // risposta JSON.
    @Query("SELECT r FROM Request r JOIN FETCH r.user WHERE r.id = :id")
    Optional<Request> findWithUserById(@Param("id") Long id);

    @Query("SELECT r FROM Request r JOIN FETCH r.user WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Request> findWithUserByUserId(@Param("userId") Long userId);

    @Query("SELECT r FROM Request r JOIN FETCH r.user WHERE r.user.id IN :userIds ORDER BY r.createdAt DESC")
    List<Request> findWithUserByUserIdIn(@Param("userIds") Collection<Long> userIds);

    @Query("SELECT r FROM Request r JOIN FETCH r.user ORDER BY r.createdAt DESC")
    List<Request> findAllWithUser();

    @Query("""
            SELECT r FROM Request r
            WHERE r.user.id = :userId
            AND r.stato IN :stati
            AND r.dataInizio <= :dataFine
            AND r.dataFine >= :dataInizio
            """)
    List<Request> findSovrapposte(
            @Param("userId") Long userId,
            @Param("stati") Collection<StatoRichiesta> stati,
            @Param("dataInizio") LocalDate dataInizio,
            @Param("dataFine") LocalDate dataFine);
}
