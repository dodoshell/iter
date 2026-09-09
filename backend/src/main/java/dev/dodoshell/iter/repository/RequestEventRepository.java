package dev.dodoshell.iter.repository;

import dev.dodoshell.iter.domain.RequestEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RequestEventRepository extends JpaRepository<RequestEvent, Long> {

    @Query("SELECT e FROM RequestEvent e JOIN FETCH e.autore WHERE e.request.id = :requestId ORDER BY e.createdAt ASC")
    List<RequestEvent> findWithAutoreByRequestIdOrderByCreatedAtAsc(@Param("requestId") Long requestId);
}
