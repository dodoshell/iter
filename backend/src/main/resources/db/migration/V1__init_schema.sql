CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nome          VARCHAR(100) NOT NULL,
    cognome       VARCHAR(100) NOT NULL,
    ruolo         VARCHAR(20) NOT NULL CHECK (ruolo IN ('DIPENDENTE', 'RESPONSABILE', 'ADMIN')),
    manager_id    BIGINT REFERENCES users (id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE requests (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users (id),
    tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('FERIE', 'PERMESSO', 'MALATTIA')),
    data_inizio DATE NOT NULL,
    data_fine   DATE NOT NULL,
    note        TEXT,
    stato       VARCHAR(20) NOT NULL CHECK (stato IN ('BOZZA', 'INVIATA', 'IN_REVISIONE', 'APPROVATA', 'RESPINTA', 'RITIRATA')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (data_fine >= data_inizio)
);

CREATE TABLE request_events (
    id                BIGSERIAL PRIMARY KEY,
    request_id        BIGINT NOT NULL REFERENCES requests (id),
    stato_precedente  VARCHAR(20),
    stato_nuovo       VARCHAR(20) NOT NULL,
    autore_id         BIGINT NOT NULL REFERENCES users (id),
    motivazione       TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_manager_id ON users (manager_id);
CREATE INDEX idx_requests_user_id ON requests (user_id);
CREATE INDEX idx_requests_stato ON requests (stato);
CREATE INDEX idx_request_events_request_id ON request_events (request_id);
