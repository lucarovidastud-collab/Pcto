document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. DICHIARAZIONE ELEMENTI DOM E RIGUARDO SICUREZZA
    // ==========================================================================
    const form = document.getElementById('form-preventivo');
    const btnGenera = document.getElementById('btn-genera');
    const btnAnteprima = document.getElementById('btn-anteprima');
    const btnDownload = document.getElementById('btn-download');
    const areaAnteprima = document.getElementById('area-anteprima');
    const btnCopia = document.getElementById('btn-copia');
    const selectTemaDownload = document.getElementById('theme-download-select');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const statsContainer = document.getElementById('stats-preventivo');
    const tempoLetturaSpan = document.getElementById('tempo-lettura');
    const conteggioParoleSpan = document.getElementById('conteggio-parole');
    const budgetCounter = document.getElementById('budget-counter');

    // ==========================================================================
    // 2. VARIABILI DI STATO GLOBALI
    // ==========================================================================
    let htmlGenerato = '';
    let cssGenerato = '';
    let nomeClienteFile = 'preventivo';
    let ultimoStileSelezionato = 'moderno';
    let testoPreventivoAI = ''; 
    
    // Palette dinamica iniziale di fallback
    let paletteScraping = { primario: '#1e40af', secondario: '#2563eb', sfondo: '#ffffff', testo: '#334155' };

    // Stato iniziale pulsanti di azione (se presenti)
    if (btnAnteprima) btnAnteprima.disabled = true;
    if (btnDownload) btnDownload.disabled = true;
    if (btnCopia) btnCopia.disabled = true;

    // ==========================================================================
    // 3. GESTIONE UNIFICATA LIGHT / DARK THEME (Applicazione e Anteprima)
    // ==========================================================================
    if (themeToggleBtn) {
        console.log("🎯 [Tema] Inizializzazione modulo tema unico.");
        const sunIcon = themeToggleBtn.querySelector('.icon-sun');
        const moonIcon = themeToggleBtn.querySelector('.icon-moon');

        // Legge il tema salvato o imposta il dark di default
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        aggiornaIconaTema(currentTheme);
        
        if (selectTemaDownload) selectTemaDownload.value = currentTheme;
        console.log("🌓 [Tema] Impostato tema iniziale:", currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const newTheme = theme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            aggiornaIconaTema(newTheme);
            
            // Sincronizza automaticamente la scelta dell'export con il tema dell'app
            if (selectTemaDownload) {
                selectTemaDownload.value = newTheme;
            }
            
            console.log("🔄 [Tema] Cambiato in:", newTheme);

            // Ricalcola lo stile dell'iframe in tempo reale se è già presente l'anteprima
            if (htmlGenerato && btnAnteprima && !btnAnteprima.disabled && areaAnteprima && areaAnteprima.querySelector('iframe')) {
                const nomeAzienda = document.getElementById('nome-azienda')?.value || '';
                const linkSito = document.getElementById('link-sito')?.value || '';
                
                costruisciECompilaPreventivo(nomeAzienda, linkSito);
                renderizzaIframeInAnteprima();
            }
        });

        function aggiornaIconaTema(theme) {
            if (theme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'inline-block';
            } else {
                if (sunIcon) sunIcon.style.display = 'inline-block';
                if (moonIcon) moonIcon.style.display = 'none';
            }
        }
    } else {
        console.warn("⚠️ [Tema] Attenzione: Pulsante #theme-toggle non trovato nella pagina attuale.");
    }

    // ==========================================================================
    // 4. LOGICA DI GENERAZIONE PREVENTIVO (SUBMIT FORM)
    // ==========================================================================
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const linkSito = document.getElementById('link-sito')?.value || '';
            const usaVisualAI = linkSito.trim() !== "";

            if (btnGenera) {
                btnGenera.disabled = true;
                btnGenera.innerText = usaVisualAI ? "📸 Scatto foto al sito e analizzo il design..." : "Generazione testo in corso...";
            }
            
            if (areaAnteprima) {
                areaAnteprima.innerHTML = usaVisualAI 
                    ? `<p style="color: #8b5cf6; font-weight: bold; font-style: normal;">🤖 Puppeteer sta catturando lo schermo del sito e Gemini ne sta analizzando i colori. Ci vorrà qualche secondo...</p>`
                    : `<p style="color: #3b82f6; font-weight: bold; font-style: normal;">🤖 Nessun sito inserito: l'AI sta impaginando il preventivo con colori standard...</p>`;
            }

            const corpoGrezzo = document.getElementById('corpo-preventivo')?.value || '';
            const nomeAzienda = document.getElementById('nome-azienda')?.value || 'Cliente';
            const caratteristiche = document.getElementById('caratteristiche-azienda')?.value || '';
            
            const stileChecked = document.querySelector('input[name="stile"]:checked');
            ultimoStileSelezionato = stileChecked ? stileChecked.value : 'moderno';

            nomeClienteFile = nomeAzienda.toLowerCase().replace(/[^a-z0-9]/g, '-');

            try {
                const response = await fetch("/api/genera-preventivo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nomeAzienda, caratteristiche, corpoGrezzo, linkSito })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Errore Server HTTP ${response.status}`);
                }

                const data = await response.json();
                
                // 1. Applichiamo la palette trovata visivamente
                if (data.palette) {
                    paletteScraping = data.palette;
                    console.log("🎨 Palette estratta visivamente da Gemini:", paletteScraping);
                }

                // 2. Aggiorniamo il contatore usando il budget semantico calcolato dall'AI
                if (budgetCounter) {
                    if (data.budgetCalcolato && data.budgetCalcolato > 0) {
                        budgetCounter.innerHTML = `Budget Stimato AI: <b>${data.budgetCalcolato.toLocaleString('it-IT')} €</b>`;
                        budgetCounter.classList.add('attivo');
                    } else {
                        budgetCounter.innerHTML = `Budget Stimato AI: <b>Non specificato o 0 €</b>`;
                        budgetCounter.classList.remove('attivo');
                    }
                }

                let testoGrezzoAI = data.aiResponse.choices[0].message.content.trim();
                testoPreventivoAI = testoGrezzoAI
                    .replace(/^```html\s*/i, '')
                    .replace(/```$/, '')
                    .trim();

            } catch (error) {
                console.error("Errore durante l'elaborazione:", error);
                if (areaAnteprima) {
                    areaAnteprima.innerHTML = `<p style="color: #ef4444; font-style: normal;">❌ Errore: ${error.message}. Preventivo generato in modalità di emergenza.</p>`;
                }
                testoPreventivoAI = `<h3>Dettaglio Proposta Commerciale</h3><p>${corpoGrezzo.replace(/\n/g, '<br>')}</p>`;
                
                // Fallback per il contatore in caso di errore
                if (budgetCounter) {
                    budgetCounter.innerHTML = `Budget Stimato AI: <b>Errore di calcolo</b>`;
                    budgetCounter.classList.remove('attivo');
                }
            }

            // Assembla i file e genera l'anteprima HTML/CSS
            costruisciECompilaPreventivo(nomeAzienda, linkSito);

            if (btnGenera) {
                btnGenera.disabled = false;
                btnGenera.innerText = "Genera Preventivo con Visual AI";
            }
            
            if (btnAnteprima) btnAnteprima.disabled = false;
            if (btnDownload) btnDownload.disabled = false;

            if (areaAnteprima && !areaAnteprima.innerHTML.includes("❌ Errore")) {
                const successMsg = usaVisualAI 
                    ? `⚡ Spettacolo! L'AI ha analizzato visivamente il sito e applicato la palette (${paletteScraping.primario}). Clicca su "Mostra Anteprima Web".`
                    : `⚡ Fatto! Clicca su "Mostra Anteprima Web" per vedere il risultato.`;
                areaAnteprima.innerHTML = `<p style="color: #10b981; font-weight: bold; font-style: normal;">${successMsg}</p>`;
                
                // Attiva le statistiche di lettura e sblocca il pulsante di copia rapida
                analizzaStatistichePreventivo(testoPreventivoAI);
            }
        });
    }

    // ==========================================================================
    // 5. FUNZIONE DI ASSEMBLAGGIO HTML
    // ==========================================================================
    function costruisciECompilaPreventivo(nomeAzienda, linkSito) {
        const forzaDark = selectTemaDownload ? (selectTemaDownload.value === 'dark') : false;
        cssGenerato = ottieniCssStile(ultimoStileSelezionato, paletteScraping, forzaDark);
        
        htmlGenerato = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta Commerciale - ${nomeAzienda}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="preventivo-container">
    
    <div class="custom-hero-proposal">
        <div class="proposal-hero-left">
            <h1 class="proposal-title">
                Custom Solutions <br>
                <span class="proposal-highlight">for ${nomeAzienda}</span>
            </h1>
        </div>
        <div class="proposal-hero-right">
            <div class="proposal-floating-badge">
                <span class="badge-tag-title">STRATEGIC PROPOSAL</span>
                <p class="badge-tag-desc">Leveraging brand heritage for innovation and growth.</p>
            </div>
        </div>
    </div>

    <header class="header-preventivo">
      <div class="logo-placeholder" style="color: ${paletteScraping.primario}">Proposta Strategica</div>
      <h1>Proposta di Collaborazione Commerciale</h1>
      <h2>Destinatario: ${nomeAzienda}</h2>
      ${linkSito ? `<p class="sito-cliente">Riferimento Digitale: <a href="${linkSito}" target="_blank" style="color: ${paletteScraping.primario}">${linkSito}</a></p>` : ''}
      <p class="data-preventivo">Data di Emissione: ${new Date().toLocaleDateString('it-IT')}</p>
    </header>
    
    <main class="output-preventivo-ai">
      ${testoPreventivoAI}
    </main>
    
    <footer>
      <p>Le condizioni economiche sopra indicate sono da considerarsi strettamente confidenziali e valide per 30 giorni.</p>
      <p class="firma">Documento predisposto professionalmente per ${nomeAzienda}</p>
    </footer>
  </div>
</body>
</html>`;
    }

    // ==========================================================================
    // 6. STATISTICHE PREVENTIVO E COPIA CLIPBOARD (RICH TEXT FORMATTED)
    // ==========================================================================
    function analizzaStatistichePreventivo(testoHtml) {
        if (!statsContainer || !conteggioParoleSpan || !tempoLetturaSpan) return;

        const divTemporaneo = document.createElement('div');
        divTemporaneo.innerHTML = testoHtml;
        const testoPulito = divTemporaneo.innerText.trim();
        
        if (testoPulito.length === 0) return;

        const listaParole = testoPulito.split(/\s+/).filter(p => p.length > 0);
        const numeroParole = listaParole.length;
        const minutiLettura = Math.ceil(numeroParole / 200);
        
        conteggioParoleSpan.innerText = `📝 ${numeroParole} parole`;
        tempoLetturaSpan.innerText = `⏱️ Tempo di lettura: ~${minutiLettura} min`;
        
        statsContainer.style.display = 'flex'; 
        if (btnCopia) btnCopia.disabled = false; 
    }

    if (btnCopia) {
        btnCopia.addEventListener('click', async () => {
            try {
                // Generiamo una versione testuale pulita di fallback
                const divTemporaneo = document.createElement('div');
                divTemporaneo.innerHTML = testoPreventivoAI;
                const testoSemplice = divTemporaneo.innerText;

                // Creiamo l'oggetto ClipboardItem impostando sia il testo semplice che l'HTML formattato
                const blobHtml = new Blob([testoPreventivoAI], { type: 'text/html' });
                const blobTesto = new Blob([testoSemplice], { type: 'text/plain' });

                const data = [new ClipboardItem({
                    'text/html': blobHtml,
                    'text/plain': blobTesto
                })];

                // Scriviamo nella clipboard con la formattazione ricca
                await navigator.clipboard.write(data);
                
                // Feedback visivo sul pulsante
                const testoOriginale = btnCopia.innerHTML;
                btnCopia.innerHTML = '✅ Copiato con Formattazione!';
                const bgOriginale = btnCopia.style.backgroundColor;
                btnCopia.style.backgroundColor = '#10b981'; 
                
                setTimeout(() => {
                    btnCopia.innerHTML = testoOriginale;
                    btnCopia.style.backgroundColor = bgOriginale;
                }, 2000);
                
            } catch (err) {
                console.error('Impossibile copiare il testo formattato: ', err);
                alert('Errore durante la copia. Assicurati di dare i permessi di scrittura alla clipboard.');
            }
        });
    }

    // ==========================================================================
    // 7. AZIONI DI OUTPUT: ANTEPRIMA IFRAME E DOWNLOAD ZIP
    // ==========================================================================
    function renderizzaIframeInAnteprima() {
        if (!htmlGenerato || !areaAnteprima) return;
        areaAnteprima.innerHTML = ''; 
        
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '650px';
        iframe.style.border = 'none';
        
        const isDarkSelezionato = selectTemaDownload ? (selectTemaDownload.value === 'dark') : false;
        iframe.style.backgroundColor = isDarkSelezionato ? '#0b0f19' : '#ffffff';

        areaAnteprima.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        const htmlAnteprima = htmlGenerato.replace('<link rel="stylesheet" href="style.css">', `<style>${cssGenerato}</style>`);
        doc.write(htmlAnteprima);
        doc.close();
    }

    if (selectTemaDownload) {
        selectTemaDownload.addEventListener('change', () => {
            if (htmlGenerato && btnAnteprima && !btnAnteprima.disabled) {
                const nomeAzienda = document.getElementById('nome-azienda')?.value || '';
                const linkSito = document.getElementById('link-sito')?.value || '';
                costruisciECompilaPreventivo(nomeAzienda, linkSito);
                renderizzaIframeInAnteprima();
            }
        });
    }

    if (btnAnteprima) {
        btnAnteprima.addEventListener('click', () => {
            if (!htmlGenerato) return;
            renderizzaIframeInAnteprima();
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            if (!htmlGenerato || typeof JSZip === 'undefined') {
                if (typeof JSZip === 'undefined') console.error("JSZip non è caricato nella pagina.");
                return;
            }

            const forzaDark = selectTemaDownload ? (selectTemaDownload.value === 'dark') : false;
            const cssEsportazione = ottieniCssStile(ultimoStileSelezionato, paletteScraping, forzaDark);

            const zip = new JSZip();
            zip.file("index.html", htmlGenerato);
            zip.file("style.css", cssEsportazione);

            zip.generateAsync({ type: "blob" }).then((content) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `sito-preventivo-${nomeClienteFile}.zip`;
                link.click();
            });
        });
    }

    // ==========================================================================
    // 8. ENGINE GRAFICO: DESIGN SYSTEM DINAMICO
    // ==========================================================================
    function ottieniCssStile(stile, colori, forzaDark) {
        const coloreTesto = forzaDark ? '#cbd5e1' : '#334155'; 
        const coloreTitoli = forzaDark ? '#f8fafc' : '#0f172a'; 
        const coloreSfondoPagina = forzaDark ? '#0b0f19' : '#f8fafc';
        const coloreSfondoContainer = forzaDark ? '#151f32' : '#ffffff';
        const coloreBordi = forzaDark ? '#222f47' : '#e2e8f0';
        const coloreTabelleSfondo = forzaDark ? '#1c283f' : '#f8fafc';
        
        const bgSfondoHeroMorbido = forzaDark ? 'rgba(34, 47, 71, 0.3)' : `${colori.primario}0c`; 
        const bgFloatingBadge = forzaDark ? '#1a263e' : '#ffffff';

        const cssHeroProposal = `
        .custom-hero-proposal {
            display: flex; align-items: center; justify-content: space-between;
            background: linear-gradient(135deg, ${bgSfondoHeroMorbido} 0%, ${coloreSfondoContainer} 100%);
            border: 1px solid ${coloreBordi}; border-radius: 20px; padding: 40px; margin-bottom: 40px;
            gap: 30px; position: relative; overflow: hidden;
        }
        .proposal-title { font-size: 2.2rem !important; font-weight: 800 !important; line-height: 1.25 !important; color: ${coloreTitoli} !important; letter-spacing: -1px !important; margin: 0 !important; }
        .proposal-highlight { color: ${colori.primario} !important; }
        .proposal-floating-badge { background-color: ${bgFloatingBadge}; padding: 20px; border-radius: 14px; box-shadow: 0 15px 35px rgba(0, 0, 0, ${forzaDark ? '0.3' : '0.06'}); border: 1px solid ${coloreBordi}; max-width: 280px; }
        .badge-tag-title { display: inline-block; font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; color: ${colori.primario}; margin-bottom: 6px; }
        .badge-tag-desc { font-size: 0.85rem; color: #64748b; line-height: 1.4; margin: 0; }
        @media (max-width: 768px) {
            .custom-hero-proposal { flex-direction: column; align-items: flex-start; padding: 30px; gap: 24px; }
            .proposal-title { font-size: 1.7rem !important; }
            .proposal-floating-badge { max-width: 100%; width: 100%; }
        }`;

        const basesComuni = cssHeroProposal + `
            body { margin: 0; padding: 50px 20px; background-color: ${coloreSfondoPagina}; color: ${coloreTesto}; -webkit-font-smoothing: antialiased; transition: all 0.3s ease; }
            .preventivo-container { max-width: 850px; margin: 0 auto; background: ${coloreSfondoContainer}; padding: 50px; border-radius: 12px; box-shadow: 0 4px 30px rgba(0,0,0,0.02); border: 1px solid ${coloreBordi}; }
            .header-preventivo { margin-bottom: 40px; border-bottom: 1px solid ${coloreBordi}; padding-bottom: 30px; }
            .logo-placeholder { font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem; margin-bottom: 10px; color: ${colori.primario}; }
            h1 { font-size: 2.2rem; margin: 0; color: ${coloreTitoli}; } 
            h2 { font-size: 1.3rem; color: #64748b; margin: 5px 0; font-weight: 400; }
            .sito-cliente a { color: ${colori.primario}; text-decoration: none; }
            p { line-height: 1.7; font-size: 1rem; margin-bottom: 18px; }
            strong { color: ${coloreTitoli}; }
            ul, ol { margin-bottom: 22px; padding-left: 20px; line-height: 1.7; }
            li { margin-bottom: 6px; }
            footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid ${coloreBordi}; text-align: center; font-size: 0.9rem; color: #94a3b8; }
            .firma { font-weight: bold; margin-top: 15px; color: ${colori.primario}; }
        `;

        switch(stile) {
            case 'minimal':
                return `${basesComuni}
                    body { font-family: 'Georgia', serif; background-color: ${coloreSfondoPagina}; }
                    .preventivo-container { box-shadow: none; padding: 40px 0; background: transparent; border: none; }
                    .header-preventivo { border-bottom: 2px solid ${coloreTitoli}; }
                    h1, .logo-placeholder, .firma { color: ${coloreTitoli}; }
                    .output-preventivo-ai h2 { font-size: 1.5rem; color: ${coloreTitoli}; border-bottom: 1px solid ${coloreBordi}; padding-bottom: 6px; margin-top: 40px; }
                    .output-preventivo-ai h3 { font-size: 1.1rem; color: ${coloreTitoli}; margin-top: 25px; }
                    table { width: 100%; border-collapse: collapse; margin: 25px 0; }
                    th { text-align: left; padding: 10px; border-bottom: 2px solid ${coloreTitoli}; font-size: 0.9rem; text-transform: uppercase; color: ${coloreTitoli}; }
                    td { padding: 10px; border-bottom: 1px solid ${coloreBordi}; }
                    blockquote { margin: 20px 0; padding: 15px; border-left: 2px solid ${coloreTitoli}; font-style: italic; background: ${coloreTabelleSfondo}; }`;
            case 'corporate':
                return `${basesComuni}
                    body { font-family: 'Arial', sans-serif; }
                    .preventivo-container { border-top: 6px solid ${colori.primario}; border-radius: 8px; }
                    .output-preventivo-ai h2 { font-size: 1.6rem; color: ${colori.primario}; margin-top: 40px; border-bottom: 2px solid ${coloreBordi}; padding-bottom: 8px; }
                    .output-preventivo-ai h3 { font-size: 1.2rem; color: ${coloreTitoli}; margin-top: 25px; }
                    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    th { background-color: ${coloreTabelleSfondo}; color: ${coloreTitoli}; padding: 12px 15px; text-align: left; border-bottom: 2px solid ${coloreBordi}; }
                    td { padding: 12px 15px; border-bottom: 1px solid ${coloreBordi}; }
                    tr:nth-child(even) { background-color: ${coloreTabelleSfondo}; }
                    blockquote { margin: 25px 0; padding: 20px; background: ${coloreTabelleSfondo}; border-left: 4px solid ${colori.primario}; border-radius: 4px; }`;
            case 'creativo':
                return `${basesComuni}
                    body { font-family: system-ui, sans-serif; }
                    .preventivo-container { border-radius: 24px; padding: 60px; }
                    .logo-placeholder { background: ${colori.primario}15; padding: 4px 10px; border-radius: 12px; display: inline-block; }
                    .output-preventivo-ai h2 { font-size: 1.7rem; color: ${coloreTitoli}; margin-top: 45px; display: flex; align-items: center; }
                    .output-preventivo-ai h2::after { content: ''; flex: 1; margin-left: 15px; height: 2px; background: linear-gradient(to right, ${colori.primario}50, transparent); }
                    .output-preventivo-ai h3 { font-size: 1.25rem; color: ${colori.primario}; margin-top: 25px; }
                    table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 30px 0; border-radius: 12px; overflow: hidden; border: 1px solid ${coloreBordi}; }
                    th { background: ${coloreTabelleSfondo}; padding: 15px; text-align: left; color: ${coloreTitoli}; }
                    td { padding: 15px; border-bottom: 1px solid ${coloreBordi}; }
                    tr:last-child td { border-bottom: none; }
                    blockquote { margin: 30px 0; padding: 20px; background: ${colori.primario}08; border-radius: 16px; border: 1px dashed ${colori.primario}50; }`;
            case 'moderno':
            default:
                return `${basesComuni}
                    body { font-family: system-ui, sans-serif; }
                    .output-preventivo-ai h2 { font-size: 1.6rem; color: ${coloreTitoli}; margin-top: 40px; }
                    .output-preventivo-ai h3 { font-size: 1.2rem; color: ${coloreTitoli}; margin-top: 25px; border-left: 3px solid ${colori.primario}; padding-left: 10px; }
                    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    th { text-align: left; padding: 12px; border-bottom: 2px solid ${colori.primario}; color: ${coloreTitoli}; }
                    td { padding: 12px; border-bottom: 1px solid ${coloreBordi}; }
                    blockquote { margin: 25px 0; padding: 20px; background: ${coloreTabelleSfondo}; border-left: 4px solid ${colori.primario}; }`;
        }
    }
});