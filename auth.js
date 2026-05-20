// Importa le funzioni necessarie dall'SDK ufficiale di Firebase tramite CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Configurazione ottenuta dalla console di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBHm1OpTI2iL58fUPKK3_t_i90TFH7frJQ",
  authDomain: "pcto-1532e.firebaseapp.com",
  projectId: "pcto-1532e",
  storageBucket: "pcto-1532e.firebasestorage.app",
  messagingSenderId: "357084045096",
  appId: "1:357084045096:web:3158544307e81ca943ba1d",
  measurementId: "G-DSMYZ5SFGQ"
};

// Inizializza Firebase e i servizi di autenticazione
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Stato dell'interfaccia (true = Login, false = Registrazione)
let isLoginMode = true;

// Riferimenti agli elementi DOM
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const btnSubmit = document.getElementById('btn-auth-submit');
const linkSwitch = document.getElementById('link-switch');
const switchText = document.getElementById('switch-text');
const errorDiv = document.getElementById('auth-error');

// 1. GESTIONE DELLO SWITCH TRA LOGIN E REGISTRAZIONE
linkSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    errorDiv.style.display = 'none';
    
    if (isLoginMode) {
        authTitle.innerText = "Accedi a QuoteGen";
        authSubtitle.innerText = "Inserisci le tue credenziali per gestire i preventivi";
        btnSubmit.innerText = "Accedi";
        switchText.innerHTML = `Non hai un account? <a href="#" id="link-switch">Registrati</a>`;
    } else {
        authTitle.innerText = "Crea un Account";
        authSubtitle.innerText = "Registrati per iniziare a generare preventivi smart";
        btnSubmit.innerText = "Registrati";
        switchText.innerHTML = `Hai già un account? <a href="#" id="link-switch">Accedi</a>`;
    }
    // Riassegna l'evento al nuovo link generato dinamicamente
    document.getElementById('link-switch').addEventListener('click', () => linkSwitch.click());
});

// 2. INVIO DEL FORM (LOGIN O REGISTRAZIONE)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
        if (isLoginMode) {
            // Esegui il Login
            await signInWithEmailAndPassword(auth, email, password);
            console.log("🔓 Accesso eseguito con successo!");
        } else {
            // Esegui la Registrazione
            await createUserWithEmailAndPassword(auth, email, password);
            console.log("✨ Nuovo utente registrato!");
        }
        // Se va a buon fine, onAuthStateChanged si occuperà del redirect
    } catch (error) {
        errorDiv.style.display = 'block';
        // Traduzione dei messaggi di errore nativi di Firebase per l'utente
        switch (error.code) {
            case 'auth/invalid-credential':
                errorDiv.innerText = "Email o password errate. Riprova.";
                break;
            case 'auth/email-already-in-use':
                errorDiv.innerText = "Questa email è già associata a un account.";
                break;
            case 'auth/weak-password':
                errorDiv.innerText = "La password deve contenere almeno 6 caratteri.";
                break;
            default:
                errorDiv.innerText = "Si è verificato un errore: " + error.message;
        }
    }
});

// 3. CONTROLLO DELLO STATO DI SESSIONE IN TEMPO REALE
// Questa funzione si accorge da sola se l'utente è loggato o meno
onAuthStateChanged(auth, (user) => {
    if (user) {
        // L'utente è loggato, lo reindirizziamo alla dashboard principale (index.html)
        window.location.href = 'index.html';
    }
});