package dev.dodoshell.iter.repository;

import dev.dodoshell.iter.domain.RequestEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestEventRepository extends JpaRepository<RequestEvent, Long> {

    List<RequestEvent> findByRequestIdOrderByCreatedAtAsc(Long requestId);
}
