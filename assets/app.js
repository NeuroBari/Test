(function () {
  'use strict';

  const RSVP_LABEL = { si: 'Confermato', forse: 'Forse', attesa: 'In attesa', no: 'Non viene' };
  const RUOLO_LABEL = { specializzando: 'Specializzando', invitato: 'Invitato' };

  const $ = (id) => document.getElementById(id);
  const euro = (n) => n.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
  const somma = (arr) => arr.reduce((tot, x) => tot + (Number(x.importo) || 0), 0);

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'class') node.className = v;
      else node.setAttribute(k, v);
    });
    children.flat().forEach((c) => {
      if (c === null || c === undefined || c === '') return;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  function formatData(iso, opzioni) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('it-IT', opzioni || { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderEvento(ev, luogo) {
    document.title = ev.titolo;
    $('titolo').textContent = ev.titolo;
    $('sottotitolo').textContent = ev.sottotitolo || '';
    $('data-evento').textContent =
      formatData(ev.data, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      (ev.oraInizio ? ' · ore ' + ev.oraInizio : '') +
      (luogo && luogo.nome ? ' · ' + luogo.nome : '');

    const info = [
      ['Data', formatData(ev.data, { day: 'numeric', month: 'long', year: 'numeric' })],
      ['Orario', [ev.oraInizio, ev.oraFine].filter(Boolean).join(' – ')],
      ['Luogo', luogo && luogo.nome],
      ['Dress code', ev.dressCode],
      ['Contatti', ev.contattoOrganizzatori],
    ].filter(([, v]) => v);
    $('info-evento').replaceChildren(...info.map(([k, v]) => el('div', null, el('dt', null, k), el('dd', null, v))));
    $('note-evento').textContent = ev.note || '';

    avviaCountdown(new Date(ev.data + 'T' + (ev.oraInizio || '00:00') + ':00'));
  }

  function avviaCountdown(target) {
    const box = $('countdown');
    function tick() {
      const diff = target - new Date();
      if (isNaN(diff)) return;
      if (diff <= 0) {
        box.replaceChildren(el('div', null, el('strong', null, '🎉'), el('span', null, 'È festa!')));
        return;
      }
      const giorni = Math.floor(diff / 86400000);
      const ore = Math.floor((diff % 86400000) / 3600000);
      const minuti = Math.floor((diff % 3600000) / 60000);
      box.replaceChildren(
        ...[[giorni, 'giorni'], [ore, 'ore'], [minuti, 'minuti']].map(([n, l]) =>
          el('div', null, el('strong', null, n), el('span', null, l))
        )
      );
    }
    tick();
    setInterval(tick, 30000);
  }

  function renderProgramma(programma) {
    $('timeline').replaceChildren(
      ...(programma || []).map((p) =>
        el('li', null, el('time', null, p.ora), el('strong', null, p.titolo), p.descrizione ? el('p', null, p.descrizione) : null)
      )
    );
  }

  function renderLuogo(l) {
    if (!l) return;
    $('luogo-nome').textContent = l.nome || '';
    $('luogo-indirizzo').textContent = l.indirizzo || '';
    $('luogo-arrivo').textContent = l.comeArrivare || '';
    const link = l.linkMappa ||
      (l.lat && l.lon ? `https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lon}#map=17/${l.lat}/${l.lon}` : '');
    if (link) $('luogo-link').href = link; else $('luogo-link').hidden = true;
    if (l.lat && l.lon) {
      const d = 0.006;
      const bbox = [l.lon - d, l.lat - d / 2, l.lon + d, l.lat + d / 2].join(',');
      $('mappa').src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${l.lat},${l.lon}`;
    } else {
      $('mappa').hidden = true;
    }
  }

  function stat(valore, etichetta) {
    return el('div', { class: 'stat' }, el('strong', null, valore), el('span', null, etichetta));
  }

  function renderPersone(persone, linkRsvp) {
    const conta = (fn) => persone.filter(fn).length;
    const confermati = persone.filter((p) => p.rsvp === 'si');
    const totaleConfermati = confermati.reduce((t, p) => t + 1 + (Number(p.accompagnatori) || 0), 0);
    $('stats-persone').replaceChildren(
      stat(totaleConfermati, 'persone attese (con +1)'),
      stat(conta((p) => p.ruolo === 'specializzando'), 'specializzandi'),
      stat(conta((p) => p.ruolo === 'invitato'), 'invitati'),
      stat(conta((p) => p.rsvp === 'forse' || p.rsvp === 'attesa'), 'risposte in sospeso')
    );

    const cerca = $('cerca'), fRuolo = $('filtro-ruolo'), fRsvp = $('filtro-rsvp');
    function aggiorna() {
      const q = cerca.value.trim().toLowerCase();
      const righe = persone
        .filter((p) => (!q || p.nome.toLowerCase().includes(q)) &&
          (!fRuolo.value || p.ruolo === fRuolo.value) &&
          (!fRsvp.value || p.rsvp === fRsvp.value))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
        .map((p) =>
          el('tr', null,
            el('td', null, p.nome),
            el('td', null, RUOLO_LABEL[p.ruolo] || p.ruolo || ''),
            el('td', null, p.anno || ''),
            el('td', null, p.accompagnatori ? '+' + p.accompagnatori : ''),
            el('td', null, el('span', { class: 'badge ' + (p.rsvp || 'attesa') }, RSVP_LABEL[p.rsvp] || RSVP_LABEL.attesa))
          )
        );
      $('tabella-persone').replaceChildren(
        ...(righe.length ? righe : [el('tr', null, el('td', { colspan: '5', class: 'muted' }, 'Nessun risultato'))])
      );
    }
    [cerca, fRuolo, fRsvp].forEach((c) => c.addEventListener('input', aggiorna));
    aggiorna();

    if (linkRsvp) {
      $('link-rsvp').replaceChildren(el('a', { class: 'btn', href: linkRsvp, target: '_blank', rel: 'noopener' }, 'Conferma la tua presenza'));
    }
  }

  function renderRegalo(r, persone, linkContributo) {
    if (!r) return;
    const contributi = r.contributi || [];
    const spese = r.spese || [];
    const raccolto = somma(contributi);
    const speso = somma(spese);
    const obiettivo = Number(r.obiettivo) || 0;
    const perc = obiettivo ? Math.min(100, Math.round((raccolto / obiettivo) * 100)) : 0;

    $('regalo-descrizione').textContent = r.descrizione || '';
    $('raccolto').textContent = `${euro(raccolto)} raccolti`;
    $('obiettivo').textContent = obiettivo ? `obiettivo ${euro(obiettivo)} (${perc}%)` : '';
    $('progress').setAttribute('aria-valuenow', perc);
    requestAnimationFrame(() => { $('progress-bar').style.width = perc + '%'; });

    $('stats-regalo').replaceChildren(
      stat(contributi.length, 'contributi ricevuti'),
      stat(euro(Math.max(0, obiettivo - raccolto)), 'mancano all\'obiettivo'),
      stat(euro(speso), 'già spesi'),
      stat(euro(raccolto - speso), 'saldo in cassa'),
      ...(r.quotaSuggerita ? [stat(euro(r.quotaSuggerita), 'quota suggerita')] : []),
      ...(r.scadenza ? [stat(formatData(r.scadenza), 'scadenza versamenti')] : [])
    );

    $('metodi').replaceChildren(
      ...(r.metodiPagamento || []).map((m) => el('li', null, el('strong', null, m.tipo), m.dettagli))
    );
    if (linkContributo) {
      $('link-contributo').replaceChildren(
        el('a', { class: 'btn', href: linkContributo, target: '_blank', rel: 'noopener' }, 'Segnala il tuo versamento')
      );
    }

    const mostraImporti = r.mostraImportiIndividuali === true;
    $('contributi').replaceChildren(
      ...(contributi.length
        ? [...contributi].sort((a, b) => (b.data || '').localeCompare(a.data || '')).map((c) =>
            el('li', null,
              el('span', null, c.nome, ' ', el('span', { class: 'data' }, formatData(c.data))),
              mostraImporti ? el('strong', null, euro(Number(c.importo) || 0)) : el('span', null, '✓')
            ))
        : [el('li', { class: 'muted' }, 'Ancora nessun contributo')])
    );
    $('spese').replaceChildren(
      ...(spese.length
        ? spese.map((s) =>
            el('li', null,
              el('span', null, s.voce, ' ', el('span', { class: 'data' }, formatData(s.data))),
              el('strong', null, euro(Number(s.importo) || 0))
            ))
        : [el('li', { class: 'muted' }, 'Nessuna spesa registrata')])
    );

    const haVersato = new Set(contributi.map((c) => c.nome.trim().toLowerCase()));
    const mancanti = persone.filter((p) =>
      p.ruolo === 'specializzando' && p.rsvp !== 'no' && !haVersato.has(p.nome.trim().toLowerCase()));
    $('mancanti').replaceChildren(
      ...(mancanti.length ? mancanti.map((p) => el('li', null, p.nome)) : [el('li', null, 'Tutti in regola 🎉')])
    );
  }

  fetch('data/festa.json', { cache: 'no-store' })
    .then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then((dati) => {
      const persone = dati.persone || [];
      const moduli = dati.moduli || {};
      renderEvento(dati.evento || {}, dati.luogo);
      renderProgramma(dati.programma);
      renderLuogo(dati.luogo);
      renderPersone(persone, moduli.rsvp);
      renderRegalo(dati.regalo, persone, moduli.contributo);
    })
    .catch((err) => {
      const box = $('errore');
      box.hidden = false;
      box.textContent = 'Impossibile caricare data/festa.json (' + err.message + '). Controlla che il file sia un JSON valido.';
    });
})();
