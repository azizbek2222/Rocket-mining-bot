import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDIeG8dVbm0Yk7FR1hPzrBoD7rgDKWAFoY",
    authDomain: "user1111-c84a0.firebaseapp.com",
    databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
    projectId: "user1111-c84a0",
    storageBucket: "user1111-c84a0.firebasestorage.app",
    messagingSenderId: "901723757936",
    appId: "1:901723757936:web:9da0a1c7ec494f4a0c03b5"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const webApp = window.Telegram.WebApp;

const userId = webApp.initDataUnsafe?.user ? "tg_" + webApp.initDataUnsafe.user.id : "guest";

async function loadStats() {
    const snap = await get(ref(db, 'users/' + userId));
    if (snap.exists()) {
        const data = snap.val();
        document.getElementById('refCount').innerText = data.referralCount || 0;
        document.getElementById('totalBonus').innerText = (data.referralEarnings || 0).toFixed(6) + " TON";
    }

    if (userId !== "guest") {
        const rawId = userId.replace("tg_", "");
        const botUsername = "rocket_mining_bot"; 
        const appName = "mining"; 
        document.getElementById('refLink').innerText = `https://t.me/${botUsername}/${appName}?startapp=${rawId}`;
    }
}

loadStats();
