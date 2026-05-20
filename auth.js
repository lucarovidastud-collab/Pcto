import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ INCOLLA QUI IL TUO REALE OGGETTO DI CONFIGURAZIONE DI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBHm1OpTI2iL58fUPKK3_t_i90TFH7frJQ",
  authDomain: "pcto-1532e.firebaseapp.com",
  projectId: "pcto-1532e",
  storageBucket: "pcto-1532e.firebasestorage.app",
  messagingSenderId: "357084045096",
  appId: "1:357084045096:web:3158544307e81ca943ba1d",
  measurementId: "G-DSMYZ5SFGQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnText = document.getElementById('btn-text');
const authSubtitle = document.getElementById('auth-subtitle');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const btnGoogle = document.getElementById('btn-google');

let isLoginMode = true;

tabLogin.addEventListener('click', () => {
    isLoginMode = true;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    btnText.innerText = "Accedi";
    authSubtitle.innerText = "Accedi per gestire i tuoi preventivi";
});

tabRegister.addEventListener('click', () => {
    isLoginMode = false;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    btnText.innerText = "Registrati ora";
    authSubtitle.innerText = "Crea un account gratuito in pochi secondi";
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        } else {
            await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        }
    } catch (error) {
        alert("Errore: " + error.message);
    }
});

// LOGIN CON GOOGLE
btnGoogle.addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        alert("Impossibile accedere con Google: " + error.message);
    }
});

// Se l'utente è loggato, rimandalo alla vera app (index.html)
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "/index.html";
    }
});