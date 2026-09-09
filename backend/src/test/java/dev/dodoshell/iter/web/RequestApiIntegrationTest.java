package dev.dodoshell.iter.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.dodoshell.iter.web.dto.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Esercita l'API HTTP reale (autenticazione, autorizzazione, macchina a
 * stati) contro un Postgres vero avviato con Testcontainers, con lo stesso
 * schema e gli stessi dati demo che Flyway applica in produzione.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class RequestApiIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void jwtProperties(DynamicPropertyRegistry registry) {
        registry.add("iter.jwt.secret", () -> "test-only-secret-test-only-secret-test-only-secret");
    }

    private static final String PASSWORD_DEMO = "Password123!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginConCredenzialiValideRestituisceUnToken() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("sara.colombo@iter.dev", PASSWORD_DEMO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void loginConPasswordErrataRestituisceErroreUniforme() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("sara.colombo@iter.dev", "sbagliata"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.codice").value("CREDENZIALI_NON_VALIDE"));
    }

    @Test
    void richiedereLeRichiesteSenzaTokenNonEAutorizzato() throws Exception {
        mockMvc.perform(get("/api/requests"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unDipendenteVedeSoloLeProprieRichieste() throws Exception {
        String token = login("sara.colombo@iter.dev");

        mockMvc.perform(get("/api/requests").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(4))
                .andExpect(jsonPath("$[?(@.userId != 4)]").isEmpty());
    }

    @Test
    void unDipendenteNonPuoApprovareLaPropriaRichiestaNemmenoViaApi() throws Exception {
        String token = login("sara.colombo@iter.dev");

        // richiesta id 3 (Sara Colombo) è IN_REVISIONE nel seed
        mockMvc.perform(post("/api/requests/3/transitions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"azione\":\"APPROVA\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.codice").value("TRANSIZIONE_NON_CONSENTITA"));
    }

    @Test
    void ilResponsabileDirettoPuoApprovareLaRichiestaDelSottoposto() throws Exception {
        String token = login("giulia.ferrari@iter.dev");

        // richiesta id 3 (Sara Colombo, sottoposta di Giulia) è IN_REVISIONE nel seed
        mockMvc.perform(post("/api/requests/3/transitions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"azione\":\"APPROVA\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.stato").value("APPROVATA"));
    }

    private String login(String email) throws Exception {
        String corpo = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, PASSWORD_DEMO))))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(corpo).get("token").asText();
    }
}
