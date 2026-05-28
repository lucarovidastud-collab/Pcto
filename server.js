import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(express.static(__dirname));
app.use(express.static(publicDir));

const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// FUNZIONE DI SCRAPING OTTIMIZZATA E LEGGERA
async function scattaScreenshotSito(url) {
    if (!url) return null;
    console.log(`🌐 Avvio browser invisibile per analizzare visivamente: ${url}`);
    
    let browser;
    try {
        if (process.env.VERCEL) {
            // Runtime Chromium compatibile con serverless Vercel.
            const [{ default: chromium }, { default: puppeteerCore }] = await Promise.all([
                import('@sparticuz/chromium'),
                import('puppeteer-core')
            ]);

            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: { width: 1024, height: 768 },
                executablePath: await chromium.executablePath(),
                headless: chromium.headless
            });
        } else {
            browser = await puppeteer.launch({
                headless: "new",
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 768 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const screenshotBase64 = await page.screenshot({ type: 'jpeg', quality: 50, encoding: 'base64' });
        console.log("📸 Screenshot catturato e ottimizzato per l'AI!");
        
        return screenshotBase64;
    } catch (error) {
        console.error("❌ Errore durante lo screenshot di Puppeteer:", error.message);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}

// ENDPOINT PRINCIPALE CON PARSING SEMANTICO DEL BUDGET
app.post('/api/genera-preventivo', async (req, res) => {
    const { nomeAzienda, caratteristiche, corpoGrezzo, linkSito } = req.body;

    if (!corpoGrezzo || !nomeAzienda) {
        return res.status(400).json({ error: "Nome azienda e appunti sono obbligatori." });
    }

    try {
        const immagineBase64 = await scattaScreenshotSito(linkSito);

        const messaggiPrompt = [
            {
                role: "system",
                content: `Sei un copywriter professionista ed esperto di impaginazione editoriale e brand identity.
                Il tuo compito è trasformare gli appunti grezzi in un preventivo commerciale ordinato, elegante e perfettamente strutturato. Scrivi IN ESCLUSIVO HTML SEMANTICO.

                ANALISI DELLA BRAND IDENTITY (FONDAMENTALE):
                Se ti viene fornita l'immagine dello screenshot del sito web del cliente, analizzala attentamente per identificare la sua Brand Identity visiva:
                1. Identifica il colore primario del logo o del brand (es. il rosso per KFC, il blu per Facebook, ecc.).
                2. Identifica un colore secondario di accento.
                3. Stabilisci un colore di sfondo chiaro neutro adatto e un colore del testo scuro leggibile.
                
                Devi assolutamente restituire questa palette di colori inserendo in cima o in fondo alla tua risposta il tag personalizzato XML <palette_colori> contenente un oggetto JSON valido.
                Esempio di formato richiesto:
                <palette_colori>
                {
                  "primario": "#e4002b",
                  "secondario": "#111111",
                  "sfondo": "#ffffff",
                  "testo": "#222222"
                }
                </palette_colori>

                REGOLE DI IMPAGINAZIONE ESTETICA DEL TESTO:
                1. GERARCHIA: Usa i tag <h2> per i titoli dei macro-capitoli e i tag <h3> per i singoli servizi o sotto-sezioni.
                2. ELENCHI PULITI: Usa liste puntate (<ul>) o ordinate (<ol>) per rendere i dati tecnici facili da leggere a colpo d'occhio.
                3. TABELLE NEUTRE: Quando elenchi i costi o i pacchetti, usa SEMPRE una tabella HTML (<table>, <tr>, <th>, <td>). Non scrivere i prezzi dentro ai paragrafi di testo.
                4. CITAZIONI/NOTE: Se c'è una nota importante, un bonus o una scadenza, inseriscila dentro il tag <blockquote> per isolarla visivamente dal resto del testo.

                REGOLE RIGOROSE DI CODICE:
                - È ASSOLUTAMENTE VIETATO usare l'attributo 'style' nel testo del preventivo, classi CSS inventate o tag come <font>. Non colorare MAI il testo o i titoli a mano. Genera solo HTML puro.
                - Non usare mai il tag <h1>.

                ESTRAZIONE INTELLIGENTE DEL BUDGET FINALE:
                Analizza semanticamente gli appunti grezzi inseriti dall'utente per comprendere l'effettivo ammontare economico totale del preventivo. 
                - Somma SOLO ed ESCLUSIVAMENTE le cifre associate a reali voci di costo o servizi venduti.
                - Ignora totalmente altri numeri presenti nel testo che indicano scadenze (es. "valido 30 giorni"), contatti telefonici, quantità di pagine o ID.
                - Restituisci la cifra finale calcolata racchiudendola nel tag XML personalizzato <budget_totale>[numero_puro]</budget_totale>. Scrivi solo il numero intero o decimale con il punto, senza simboli di valuta (es: <budget_totale>1500.00</budget_totale>).`
            }
        ];

        if (immagineBase64) {
            messaggiPrompt.push({
                role: "user",
                content: [
                    { 
                        type: "text", 
                        text: `Ecco gli appunti per il preventivo destinato a "${nomeAzienda}". Contesto: ${caratteristiche || 'Non specificato'}. Appunti: ${corpoGrezzo}` 
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:image/jpeg;base64,${immagineBase64}`
                        }
                    }
                ]
            });
        } else {
            messaggiPrompt.push({
                role: "user",
                content: `Ecco gli appunti per il preventivo destinato a "${nomeAzienda}". Appunti: ${corpoGrezzo}`
            });
        }

        console.log("🤖 Invio dei dati ottimizzati a OpenRouter (Gemini)...");
        
        const openRouterResponse = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "google/gemini-2.5-flash", 
                messages: messaggiPrompt,
                max_tokens: 2500,
                temperature: 0.2
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!openRouterResponse.data.choices || openRouterResponse.data.choices.length === 0) {
            throw new Error("Risposta vuota da OpenRouter. Controlla il bilancio del tuo account.");
        }

        const rispostaAI = openRouterResponse.data.choices[0].message.content;

        // Palette di emergenza
        let paletteEstratta = { primario: '#dc2626', secondario: '#475569', sfondo: '#ffffff', testo: '#334155' };
        const matchPalette = rispostaAI.match(/<palette_colori>([\s\S]*?)<\/palette_colori>/);
        
        let testoPulitoAI = rispostaAI;
        if (matchPalette) {
            try {
                paletteEstratta = JSON.parse(matchPalette[1].trim());
                testoPulitoAI = testoPulitoAI.replace(/<palette_colori>[\s\S]*?<\/palette_colori>/, '').trim();
            } catch (e) {
                console.error("Errore nel parsing JSON della palette:", e.message);
            }
        }

        // Estrazione semantica del Budget calcolato da Gemini
        let budgetCalcolato = 0;
        const matchBudget = testoPulitoAI.match(/<budget_totale>([\s\S]*?)<\/budget_totale>/);
        if (matchBudget) {
            const cifraPura = parseFloat(matchBudget[1].trim());
            if (!isNaN(cifraPura)) {
                budgetCalcolato = cifraPura;
            }
            testoPulitoAI = testoPulitoAI.replace(/<budget_totale>[\s\S]*?<\/budget_totale>/, '').trim();
        }

        res.json({
            palette: paletteEstratta,
            budgetCalcolato: budgetCalcolato, 
            aiResponse: {
                choices: [{ message: { content: testoPulitoAI } }]
            }
        });

    } catch (error) {
        // Log dettagliato nel terminale per capire SUBITO cosa risponde OpenRouter
        console.error("❌ ERRORE DETTAGLIATO DEL SERVER:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data?.error?.message || "Errore interno durante la generazione del preventivo." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server Multimodale Ottimizzato su http://localhost:${PORT}`);
    });
}

export default app;