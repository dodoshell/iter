package dev.dodoshell.iter.config;

import dev.dodoshell.iter.workflow.RichiestaStateMachine;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WorkflowConfig {

    // RichiestaStateMachine resta volutamente senza annotazioni Spring (vedi il
    // suo Javadoc): il bean viene dichiarato qui, non sulla classe stessa.
    @Bean
    public RichiestaStateMachine richiestaStateMachine() {
        return new RichiestaStateMachine();
    }
}
