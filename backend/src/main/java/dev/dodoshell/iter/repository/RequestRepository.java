package dev.dodoshell.iter.repository;

import dev.dodoshell.iter.domain.Request;
import dev.dodoshell.iter.workflow.StatoRichiesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {

    List<Request> findByUserId(Long userId);

    List<Request> findByUserIdIn(Collection<Long> userIds);

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
