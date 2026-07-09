-- Suivi Qualité — Ligne Lavage
-- Table principale des fiches de défaut / réparation

CREATE TABLE IF NOT EXISTS fiches (
    id                    SERIAL PRIMARY KEY,
    date_constat          DATE NOT NULL,
    matricule_controleur  VARCHAR(50) NOT NULL,
    matricule_operateur   VARCHAR(50) NOT NULL,
    capacite              VARCHAR(50) NOT NULL,
    modele                VARCHAR(50) NOT NULL,
    materiau              VARCHAR(50),
    article               VARCHAR(200) NOT NULL,
    probleme_type         VARCHAR(100) NOT NULL,
    variation             VARCHAR(150) NOT NULL,
    defaut                VARCHAR(200) NOT NULL,
    poste                 VARCHAR(150) NOT NULL,
    quantite              INTEGER NOT NULL DEFAULT 1,
    status                VARCHAR(20) NOT NULL DEFAULT 'Ouverte',
    temps_reparation      INTEGER,
    visa_controleur_final VARCHAR(50),
    date_visa             DATE,
    confirmed             BOOLEAN NOT NULL DEFAULT FALSE,
    date_confirmation     DATE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fiches_status ON fiches(status);
CREATE INDEX IF NOT EXISTS idx_fiches_date ON fiches(date_constat);
