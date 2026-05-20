Documento di Analisi Tecnica e Studio di Fattibilità
Progetto: Piattaforma Automatizzata per la Generazione di Preventivi Web Eleganti (QuoteGen Engine)
1. Inquadramento del Progetto e Contesto Didattico
Il presente documento di analisi tecnica e strutturale viene redatto nel contesto del percorso di Percorsi per le Competenze Trasversali e l'Orientamento (PCTO) svolto presso l'azienda informatica DMA. L'obiettivo dell'esperienza, condotta da uno studente dell'Istituto Tecnico "Blaise Pascal" di Cesena, consiste nell'analizzare, progettare, mappare i requisiti architetturali e implementare un prototipo funzionante per una web application innovativa volta all'ottimizzazione dei processi di vendita B2B (Business-to-Business).
L'esigenza di mercato a cui il progetto risponde risiede nella rigidità dei classici preventivi inviati in formato PDF o come documenti di testo statici. Questi formati tradizionali spesso falliscono nel trasmettere l'identità del brand e non permettono un'interazione dinamica o un'esperienza utente moderna. La soluzione sviluppata mira a trasformare appunti commerciali destrutturati in una landing page elegante, responsive, interattiva, dotata di switch per il tema visivo (Light/Dark Mode) e completamente personalizzata in tempo reale sulla base dell'identità visiva e cromatica dell'azienda cliente.
2. Descrizione Generale del Sistema e Funzionamento
La web application opera come un motore di trasformazione, arricchimento semantico tramite intelligenza artificiale e rendering asincrono in tempo reale. L'utente aziendale (l'operatore commerciale) compila un modulo di configurazione minimale fornendo i seguenti parametri fondamentali di input:
Nome dell'azienda cliente: Per la personalizzazione testuale e dei metadati.
Sito Web del cliente (Opzionale ma consigliato): Utilizzato dal sistema per avviare una sessione di navigazione automatizzata ("browser fantasma").
Contesto/Caratteristiche: Informazioni sul settore o sulle specifiche commerciali del cliente.
Appunti Grezzi (Corpo del Preventivo): Testo libero, idee destrutturate, elenchi di voci economiche e note commerciali inserite senza vincoli formali.
Stile grafico desiderato: Selezione predefinita tramite un set di archetipi stilistici (es. Moderno, Minimal, Corporate, Creativo).
Flusso di Elaborazione Dinamico:
Cattura e Analisi Visiva: Il backend avvia un'istanza headless di Google Chrome che naviga sul sito del cliente, ne cattura uno screenshot ottimizzato in formato Base64 e lo inoltra al motore AI.
Elaborazione Multimodale e Ingegneria Editoriale: Un modello di linguaggio avanzato (Gemini-2.5-Flash tramite le API di OpenRouter) analizza simultaneamente il testo grezzo e lo screenshot visivo del sito web. L'AI esegue tre operazioni chiave in un unico passaggio:
Generazione del Copywriting: Riformula gli appunti in un testo commerciale persuasivo, strutturato esclusivamente in HTML semantico puro.
Estrazione della Brand Identity Visiva: Analizza lo screenshot ed estrae una terna di colori dominanti (Primary, Secondary, Background, Text) restituita in formato JSON strutturato all'interno di tag XML personalizzati (<palette_colori>).
Calcolo Semantico del Budget: Analizza le voci di costo, isolandole da scadenze o stringhe numeriche fuorvianti, e calcola il totale finale racchiudendolo nel tag <budget_totale>.
Sanitizzazione e Rendering Iframe: Il backend risponde al frontend isolando l'HTML pulito dal budget e dalla palette. Il frontend aggiorna un widget interattivo con il budget calcolato e inietta l'HTML all'interno di una finestra di anteprima digitale strutturata tramite un iframe isolato, applicando dinamicamente i fogli di stile CSS calcolati sulla palette cromatiche del cliente e sincronizzati con il tema dell'applicazione.
3. Analisi Dettagliata dei Requisiti (Requirements Engineering)
3.1 Tabella dei Requisiti Funzionali Aggiornata
Codice
Nome Requisito
Descrizione Dettagliata
Priorità
 
RF-01
Navigazione Headless
Il sistema deve istanziare un browser invisibile via Puppeteer per navigare l'URL del cliente e scattare uno screenshot JPEG ottimizzato (qualità 50%) codificato in Base64.
Massima
RF-02
Analisi Multimodale AI
Integrazione con l'API OpenRouter (modello Gemini-2.5-Flash) per processare simultaneamente testo e immagine, producendo output HTML semantico senza stili inline.
Massima
RF-03
Estrazione Brand Identity
L'AI deve rilevare i colori dominanti del sito cliente dall'immagine e restituire un JSON strutturato con i codici esadecimali all'interno del tag <palette_colori>.
Massima
RF-04
Parsing Semantico Budget
L'AI deve sommare matematicamente le sole cifre associate a reali voci di costo negli appunti, ignorando scadenze, numeri di telefono o ID, isolando il totale nel tag <budget_totale>.
Massima
RF-05
Doppia Modalità Visiva
L'interfaccia dell'applicazione e il motore di rendering dell'anteprima devono supportare dinamicamente lo switch nativo tra Light Mode e Dark Mode via attributo data-theme.
Massima
RF-06
Blocco dell'Autofill Glitch
Il foglio di stile deve sovrascrivere i comportamenti nativi dei browser (Chrome/Edge) impedendo lo sbiancamento degli input o la corruzione dei colori di sfondo durante l'autocompilazione dei moduli.
Massima
RF-07
Generazione Widget Hero
Il sistema deve iniettare dinamicamente in cima al preventivo una card visiva d'impatto ("Hero Custom Solution") stilizzata ad hoc con i colori del brand cliente.
Media

3.2 Requisiti Non Funzionali
RNF-01 (Prestazioni e Timeout): L'intero ciclo di elaborazione — comprendente il ciclo di vita di Puppeteer (avvio, navigazione, screenshot, chiusura) e la chiamata API asincrona all'LLM — deve completarsi entro un tempo massimo di 30 secondi, con una media target di 5-7 secondi.
RNF-02 (Robustezza del Parsing): In caso di fallimento della navigazione di Puppeteer (es. blocchi anti-bot o URL non valido), il server deve catturare l'errore senza crashare, effettuando un fallback su una palette cromatica di sicurezza standard ed eseguendo la chiamata all'AI in modalità puramente testuale.
RNF-03 (Manutenibilità del Codice): Il codice frontend deve separare nettamente le basi comuni del layout dai CSS dinamici calcolati a runtime in base alla palette estratta e all'archetipo grafico selezionato.
RNF-04 (Coerenza di Contrasto): L'applicazione delle proprietà cromatiche ereditate dall'AI deve garantire i rapporti di contrasto minimi richiesti dalle specifiche WCAG 2.1 per i testi all'interno del preventivo.
  4. Architettura Software e Stack Tecnologico Realizzato
L'applicazione è stata sviluppata strutturando un'architettura monolitica modulare basata interamente sull'ecosistema JavaScript (Node.js per il backend e Vanilla JS moderno per il frontend), garantendo elevate prestazioni di rendering e assenza di overhead di compilazione.
[ FRONTEND (Dashboard commerciale) ]  --> Invia Nome, Sito, Appunti Grezzi
       │
       ▼ (Chiamata HTTP POST via Axios / Fetch JSON con limite 50mb)
[ BACKEND (Express Server) ]          --> Istanzia Puppeteer (Browser invisibile)
       │                                  │
       │                                  ▼ Scatta Screenshot (Base64)
       ▼
[ API OPENROUTER (Gemini 2.5) ]      <-- Analizza congiuntamente Testo + Immagine
       │
       ▼ Ritorna HTML Semantico + <palette_colori> JSON + <budget_totale>
[ BACKEND (Express Server) ]          --> Pulisce i tag XML e calcola i dati di risposta
       │
       ▼ (Risposta JSON Strutturata)
[ FRONTEND (Dashboard commerciale) ]  --> Renderizza Iframe con Stili Dinamici & Widget Hero


4.1 Struttura e Logica del Frontend (index.html, style.css, script.js)
L'interfaccia utente implementa un layout a singola pagina (SPA) responsive, organizzato in sezioni logiche: form di configurazione, pannello delle opzioni con radio button per gli archetipi e un'area di anteprima avanzata denominata .preview-window, strutturata come un mockup grafico di un browser reale (dotata di barra dei comandi e pallini decorativi).
Il frontend gestisce autonomamente:
La gestione del tema globale: Tramite l'attivazione della classe o dell'attributo [data-theme="dark"] che commuta istantaneamente i token CSS di sfondo, bordi e testi, implementando transizioni fluide (transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)).
L'isolamento del preventivo: Il codice generato viene inserito dinamicamente in un componente iframe. Questa scelta architetturale è indispensabile per evitare conflitti stilistici (CSS Pollution) tra il foglio di stile della dashboard e gli stili dinamici applicati al preventivo finale del cliente.
4.2 Architettura del Backend (server.js)
Sviluppato in Node.js con il framework Express, il server espone un endpoint principale (/api/genera-preventivo) configurato per accettare payload ad alta capacità (limit: '50mb') per supportare il transito sicuro delle stringhe di immagini. Il backend incapsula la logica di automazione di Puppeteer e la pipeline di comunicazione con le API esterne.
5. Studio di Fattibilità e Analisi di Dettaglio dei Componenti Sviluppati
5.1 Il Microservizio di Navigazione e Cattura Visiva (Puppeteer)
La funzione scattaScreenshotSito(url) implementa l'automazione del browser headless. L'analisi di fattibilità ha evidenziato la necessità di configurare parametri specifici per operare in ambienti server limitati e aggirare i controlli anti-bot elementari:
Viene impostata una Viewport fissa a 1024x768 pixel per catturare la porzione "Above the Fold" del sito (l'area visiva d'impatto).
Viene iniettato un User-Agent realistico di Chrome Desktop per mitigare i rifiuti di connessione.
L'ottimizzazione dell'immagine viene eseguita direttamente a livello hardware dal browser, richiedendo uno screenshot in formato jpeg con compressione qualitativa impostata al 50%. Questa tecnica riduce drasticamente il peso della stringa Base64 trasmessa via rete, abbattendo i tempi di latenza e i costi di computazione dei token di input dell'API multimodale.
5.2 Ingegnerizzazione del Prompt di Sistema (Prompt Engineering)
Per garantire che il modello Gemini esegua in modo deterministico e rigoroso le operazioni richieste, il backend implementa un system prompt configurato come una macchina a stati semantica. Il prompt impone all'AI di agire come esperto di brand identity e impaginazione editoriale:
Vincolo Strutturale: Obbligo di produrre esclusivamente HTML semantico puro (<h2>, <h3>, <ul>, <table>, <blockquote>). Divieto assoluto di usare stili inline (style="..."), tag obsoleti (<font>) o classi CSS arbitrarie.
Output Multi-Canale: L'AI è istruita a incapsulare i metadati strutturati (il calcolo economico e la terna esadecimale della palette) all'interno di tag pseudo-XML proprietari. Questo approccio permette al server di eseguire un parsing string-matching pulito ed efficiente tramite espressioni regolari (Regex), separando i dati logici dal corpo del testo prima dell'invio al client.
5.3 Il Motore di Rendering Dinamico e la Card Ereditata ("Hero Proposal")
Il sistema implementa l'iniezione automatica di una sezione di benvenuto monumentale in cima alla pagina del preventivo, denominata .custom-hero-proposal. Questo blocco viene generato dinamicamente unendo l'HTML strutturato nella funzione costruisciECompilaPreventivo con le regole CSS calcolate a runtime all'interno di ottieniCssStile. La card applica i colori estratti dalla palette visiva in modo intelligente:
Viene calcolata una tinta di sfondo estremamente morbida e desaturata basata sul colore primario dell'azienda cliente per garantire l'eleganza estetica (${colori.primario}0c in modalità light, oppure una sfumatura trasparente rgba(34, 47, 71, 0.3) in modalità dark).
Il nome dell'azienda viene enfatizzato applicando in modo puro il colore del brand principale (.proposal-highlight { color: colori.primario }).
A destra viene posizionato un badge tridimensionale fluttuante (.proposal-floating-badge) che muta il proprio colore di sfondo interno in base al tema selezionato per il download (#ffffff per il tema chiaro, #1a263e per il tema scuro), aumentando un'ombreggiatura calibrata per l'effetto di profondità.
6. Difficoltà Tecniche Risolte e Soluzioni di Ingegneria del Software
6.1 Risoluzione del Glitch Visivo da Autocompilazione (Chrome Autofill Bug)
Una delle problematiche più critiche emerse durante i test di usabilità dell'interfaccia utente ha riguardato il comportamento invasivo del motore di rendering di Google Chrome, Microsoft Edge e Safari. Quando l'utente utilizza la funzionalità di autocompilamento nativa del browser per inserire rapidamente il nome dell'azienda o l'URL del sito, il browser forza internamente la pseudo-classe :-webkit-autofill. Questo comportamento sovrascrive totalmente le variabili CSS dell'applicazione, imponendo uno sfondo giallino o bianco fisso e alterando il colore del testo, rendendo i campi illeggibili e rompendo la coerenza visiva sia nel tema Light che, in modo distruttivo, nel tema Dark.
Poiché i browser bloccano la modifica diretta della proprietà background-color su questo stato nativo per ragioni di sicurezza, è stato sviluppato un aggiramento ingegneristico combinando due proprietà avanzate inserite nel file style.css:
-webkit-text-fill-color: Utilizzato per forzare il browser a ereditare correttamente il colore del testo definito dalle variabili del tema applicazione (var(--text-main) o var(--text-title)), bypassando il blocco nativo.
box-shadow: inset 0 0 0 1000px var(--bg-input) !important: Invece di tentare di colorare il background (operazione ignorata dal browser), viene iniettata un'ombra interna geometrica gigante ad altissima densità che riempie interamente l'area dell'input, visualizzando il colore di sfondo corretto della variabile d'ambiente dell'app.
transition: background-color 9999s ease-in-out 0s: Una transizione temporale impostata su un valore infinito che "congela" lo stato visivo dell'input, impedendo al browser di applicare l'animazione di sfarfallio gialla originaria.
/* Esempio della soluzione implementata per il fix dell'autocompilamento in Dark Mode */
[data-theme="dark"] input:-webkit-autofill,
[data-theme="dark"] input:-webkit-autofill:hover, 
[data-theme="dark"] input:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--text-title) !important;
    transition: background-color 9999s ease-in-out 0s;
    box-shadow: inset 0 0 0 1000px var(--bg-input) !important;
}


6.2 Gestione Robusta dell'Output Semantico e Parsing Failsafe
Durante lo sviluppo si è riscontrato il rischio di fallimento nel parsing JSON della palette qualora l'AI producesse frammenti di testo spuri o errori di formattazione nei tag XML. La stabilità del server è stata garantita tramite una solida gestione delle eccezioni:
I blocchi regex catturano in modo isolato le stringhe interne ai tag <palette_colori> e <budget_totale>.
Il codice esegue un costrutto try...catch dedicato attorno a JSON.parse(). Se l'oggetto è corrotto, il server esegue istantaneamente un fallback assegnando un oggetto di palette standard e pulisce il testo del preventivo tramite una funzione di rimpiazzo strutturata (testoPulitoAI.replace(...)), garantendo che l'utente riceva sempre il preventivo impaginato senza mostrare stringhe di codice o tag orfani nell'interfaccia.
7. Piano di Sviluppo Svolto e Struttura dei Task (WBS)
Il progetto è stato scaglionato secondo una pianificazione sequenziale di 5 macro-fasi, mappate per riflettere l'avanzamento reale delle attività in azienda.
Fase 1: Setup dell'Ambiente e Configurazione Architetturale
Inizializzazione del server Express, gestione delle policy CORS per la comunicazione tra domini e configurazione delle variabili d'ambiente protette (.env) per l'archiviazione della chiave privata di OpenRouter.
Sviluppo della struttura base del frontend, implementazione dello switch nativo Light/Dark Mode e stesura del foglio di stile con variabili CSS :root.
Fase 2: Sviluppo del Microservizio Visivo (Puppeteer)
Implementazione del modulo di scraping headless. Risoluzione delle problematiche di timeout e allocazione delle risorse tramite l'iniezione dei flag di sicurezza --no-sandbox e --disable-setuid-sandbox.
Ottimizzazione dell'esportazione dello screenshot per il corretto transito dei payload in Base64 verso il server.
Fase 3: Integrazione Intelligenza Artificiale e Logica di Ingegnerizzazione del Prompt
Scrittura della pipeline HTTP client via Axios diretta agli endpoint di OpenRouter per l'interrogazione del modello multimodale Gemini-2.5-Flash.
Definizione del prompt di sistema per l'estrazione congiunta dell'HTML semantico, del budget matematico e della palette colori. Scrittura dei motori di estrazione Regex lato server.
Fase 4: Realizzazione del Motore di Rendering e Soluzione dei Bug Stilistici
Sviluppo dei componenti dinamici all'interno di script.js. Creazione del meccanismo di isolamento all'interno dell'Iframe.
Implementazione delle regole CSS geometriche della card Hero Proposal (.custom-hero-proposal) agganciate ai colori estratti dall'AI.
Risoluzione del bug dell'autocompilamento tramite l'applicazione combinata di -webkit-text-fill-color e ombreggiature interne.
Fase 5: Collaudo, Debugging e Validazione dei Risultati
Conduzione di test di stress inserendo input disordinati e siti web complessi per verificare l'accuratezza del calcolo del budget e la tenuta del sistema di fallback cromatico.
Verifica della responsività dei layout generati su dispositivi mobile tramite simulazione di viewport ridotte.
8. Conclusioni e Sviluppi Futuri
L'analisi tecnica e lo sviluppo pratico condotti all'interno dei laboratori di DMA hanno confermato l'estrema validità del sistema QuoteGen Engine. L'adozione di un modello di intelligenza artificiale multimodale (Gemini-2.5-Flash) accoppiato a uno scraper visivo nativo (Puppeteer) ha permesso di superare i limiti strutturali dei vecchi sistemi basati su template rigidi.
La capacità dell'applicazione di "clonare" istantaneamente la brand identity del cliente e di formattare in modo impeccabile testi destrutturati offre un vantaggio strategico eccezionale al reparto commerciale, riducendo i tempi di stesura del preventivo da ore a pochissimi secondi, eliminando i difetti grafici causati dall'autocompilazione dei browser e massimizzando l'impatto estetico della proposta commerciale.
Come evoluzione futura del sistema, si prospetta l'estensione dell'algoritmo di scraping per l'estrazione automatica dei fogli di stile CSS originali del cliente al fine di mappare, oltre ai colori dominanti, anche la famiglia di font nativa utilizzata dal brand, iniettandola dinamicamente tramite direttive @import all'interno dell'iframe di anteprima per una fedeltà visiva totale.

