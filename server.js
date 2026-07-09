require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // requis par la plupart des Postgres hébergés (Render, Railway, Supabase...)
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

// ---- Mapping ligne SQL (snake_case) -> objet JS (camelCase) attendu par le front ----
function rowToRecord(r) {
  return {
    id: r.id,
    date: r.date_constat ? r.date_constat.toISOString().slice(0, 10) : null,
    matriculeControleur: r.matricule_controleur,
    matriculeOperateur: r.matricule_operateur,
    capacite: r.capacite,
    modele: r.modele,
    materiau: r.materiau,
    article: r.article,
    problemeType: r.probleme_type,
    variation: r.variation,
    defaut: r.defaut,
    poste: r.poste,
    quantite: r.quantite,
    status: r.status,
    tempsReparation: r.temps_reparation,
    visaControleurFinal: r.visa_controleur_final,
    dateVisa: r.date_visa ? r.date_visa.toISOString().slice(0, 10) : null,
    confirmed: r.confirmed,
    dateConfirmation: r.date_confirmation ? r.date_confirmation.toISOString().slice(0, 10) : null,
  };
}

// ---- GET : liste de toutes les fiches ----
app.get('/api/fiches', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM fiches ORDER BY id ASC');
    res.json(rows.map(rowToRecord));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la lecture des fiches.' });
  }
});

// ---- POST : créer une nouvelle fiche ----
app.post('/api/fiches', async (req, res) => {
  const r = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO fiches
        (date_constat, matricule_controleur, matricule_operateur, capacite, modele, materiau,
         article, probleme_type, variation, defaut, poste, quantite, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Ouverte')
       RETURNING *`,
      [
        r.date, r.matriculeControleur, r.matriculeOperateur, r.capacite, r.modele,
        r.materiau || null, r.article, r.problemeType, r.variation, r.defaut,
        r.poste, r.quantite,
      ]
    );
    res.status(201).json(rowToRecord(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'enregistrement de la fiche." });
  }
});

// ---- PATCH : clôturer une fiche (résolution) ----
app.patch('/api/fiches/:id/resolve', async (req, res) => {
  const { id } = req.params;
  const { tempsReparation, visaControleurFinal } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE fiches SET
         status = 'Résolue',
         temps_reparation = $1,
         visa_controleur_final = $2,
         date_visa = CURRENT_DATE,
         updated_at = now()
       WHERE id = $3
       RETURNING *`,
      [tempsReparation, visaControleurFinal, id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Fiche introuvable.' });
    res.json(rowToRecord(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la clôture de la fiche.' });
  }
});

// ---- PATCH : confirmer l'enregistrement d'une fiche ----
app.patch('/api/fiches/:id/confirm', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `UPDATE fiches SET
         confirmed = TRUE,
         date_confirmation = CURRENT_DATE,
         updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Fiche introuvable.' });
    res.json(rowToRecord(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la confirmation de la fiche.' });
  }
});

// ---- DELETE : supprimer une fiche ----
app.delete('/api/fiches/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM fiches WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression de la fiche.' });
  }
});

const fs = require('fs');

async function ensureSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('✔ Table "fiches" vérifiée/créée.');
}

const PORT = process.env.PORT || 3000;
ensureSchema()
  .then(() => {
    // On écoute sur 0.0.0.0 : requis par les hébergeurs cloud (Render, Railway...)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✔ Serveur Suivi Qualité démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✘ Impossible de préparer la base de données :', err.message);
    process.exit(1);
  });
