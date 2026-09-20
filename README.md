# agentic-ai-book-site

Sito personale di Claudio Biancalana, dedicato ad Architetture Agentiche e al blog tecnico.

## Anteprima locale

Il progetto è statico, senza build o dipendenze npm. Dalla cartella del progetto:

```sh
python -m http.server 8765 --bind 127.0.0.1
```

Aprire http://127.0.0.1:8765/ (non direttamente il file HTML: i percorsi delle risorse partono dalla radice).

## Nota sulle opinioni personali

La nota è HTML statico, visibile anche senza JavaScript, nel footer della homepage e delle quattro pagine del blog. Una nota aggiuntiva è accanto alla biografia. Mantenerla nel footer anche quando si aggiungono articoli. Lo stile condiviso si trova in `site-additions.css`.

## Post LinkedIn

La sezione `#linkedin` della homepage contiene due post selezionati: presentazione del libro e guida illustrata a 21 pattern. Non è un feed automatico.

Gli indirizzi embed sono quelli mostrati da LinkedIn in “Embed this post”. `linkedin-posts.js` crea ciascun iframe soltanto dopo il clic del visitatore; “Chiudi anteprima” rimuove il frame. Nessun cookie di consenso viene salvato. I link diretti restano disponibili senza JavaScript o se LinkedIn impedisce il caricamento. La disponibilità dipende dalla visibilità del post e dalle impostazioni LinkedIn del suo autore.

Per sostituire un post, aggiornare il link diretto, `data-embed-url`, `data-embed-title`, titolo e descrizione della scheda in `index.html`. Usare il codice ufficiale del post, non l'URL del profilo; gli ID `activity`, `share` e `ugcPost` non sono intercambiabili. Verificare i termini di incorporamento LinkedIn prima della pubblicazione online.

## Controlli

```sh
node --check linkedin-posts.js
python tests/check_site.py
```

Verificare inoltre l'anteprima desktop/mobile, il caricamento di entrambi i frame e il ritorno al pulsante dopo la chiusura.
