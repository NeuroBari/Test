# 🧠 Festa Specializzandi Neurologia 2027

Sito statico (GitHub Pages) per organizzare la festa degli specializzandi di Neurologia 2027:

- **Evento**: data, orari, dress code, contatti, countdown
- **Programma**: scaletta della serata
- **Luogo**: indirizzo, indicazioni e mappa (OpenStreetMap)
- **Partecipanti e invitati**: elenco con stato della risposta (confermato / forse / in attesa / non viene), +1, ricerca e filtri, conteggio persone attese
- **Raccolta fondi per il regalo**: obiettivo e barra di avanzamento, metodi di pagamento, contributi ricevuti, spese, saldo in cassa e lista di chi deve ancora versare

## Come aggiornare i dati

Tutti i contenuti stanno in **un solo file**: [`data/festa.json`](data/festa.json).
Per modificarlo direttamente da GitHub: apri il file → icona ✏️ → modifica → *Commit changes*.
Il sito si aggiorna da solo dopo circa un minuto.

| Sezione | Campo | Note |
|---|---|---|
| Evento | `evento` | `data` in formato `AAAA-MM-GG`, orari `HH:MM` |
| Luogo | `luogo` | `lat`/`lon` servono per la mappa (si trovano cliccando col tasto destro su OpenStreetMap o Google Maps) |
| Programma | `programma` | un elemento per ogni momento della serata |
| Persone | `persone` | `ruolo`: `specializzando` o `invitato` · `rsvp`: `si`, `forse`, `attesa`, `no` · `accompagnatori`: numero di +1 |
| Regalo | `regalo` | aggiungere ogni versamento in `contributi` e ogni uscita in `spese` |
| Moduli | `moduli` | link opzionali (es. Google Form) per confermare la presenza e segnalare il versamento: se valorizzati compaiono i pulsanti |

> ⚠️ Il JSON è sensibile alla sintassi: virgole tra gli elementi, nessuna virgola dopo l'ultimo, testi tra virgolette doppie.
> Se il file non è valido il sito mostra un messaggio d'errore.

### Privacy

Il sito GitHub Pages è **pubblico** (chiunque abbia il link può vederlo, anche se il repository è privato con piano gratuito).
Per questo:
- di default gli importi dei singoli contributi **non** vengono mostrati (solo ✓ e il totale): per mostrarli impostare `"mostraImportiIndividuali": true`;
- valutate se pubblicare l'IBAN completo o comunicarlo solo sul gruppo WhatsApp;
- evitate dati sensibili (numeri di telefono, email personali).

## Pubblicazione su GitHub Pages

1. Repository → **Settings** → **Pages**
2. *Source*: **Deploy from a branch**
3. *Branch*: il branch con questi file (es. `main`) e cartella **`/ (root)`** → **Save**
4. Dopo un paio di minuti il sito sarà su `https://<utente>.github.io/<repository>/`

## Prova in locale

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

(Aprire `index.html` con doppio clic non funziona perché il browser blocca il caricamento del JSON da file locale.)

## Struttura

```
index.html        pagina unica
assets/style.css  stile
assets/app.js     legge data/festa.json e costruisce le sezioni
data/festa.json   tutti i dati della festa (da modificare)
.nojekyll         disattiva l'elaborazione Jekyll di GitHub Pages
```
