if (window.location.hostname !== "azizbek2222.github.io") {
    document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:50px;'>Access Denied! Illegal Mirror.</h1>";
    throw new Error("Illegal Mirror detected. Script execution stopped.");
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
const userId = getUserId();
const AdController = window.Adsgram ? window.Adsgram.init({ blockId: "int-19356" }) : null;

// Foydalanuvchi holati
let fuel = 0;
let shield = 0;
let isMining = false;

function getUserId() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        return "tg_" + window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    let id = localStorage.getItem('mining_uid') || "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('mining_uid', id);
    return id;
}

// Reklama va Benzin
window.refuel = async () => {
    if (fuel >= 100 || isMining) return;
    const res = await showAd();
    if (res) {
        fuel = Math.min(fuel + 50, 100);
        updateUI();
        checkLaunch();
    }
};

// Reklama va Qalqon
window.chargeShield = async () => {
    if (shield >= 100 || isMining) return;
    const res = await showAd();
    if (res) {
        shield = Math.min(shield + 50, 100);
        updateUI();
        checkLaunch();
    }
};

async function showAd() {
    if (!AdController) {
        window.Telegram.WebApp.showAlert("Ad error");
        return false;
    }
    try {
        const result = await AdController.show();
        return result.done;
    } catch (e) {
        window.Telegram.WebApp.showAlert("No ads available");
        return false;
    }
}

function updateUI() {
    document.getElementById('fuelFill').style.width = fuel + "%";
    document.getElementById('shieldFill').style.width = shield + "%";
    
    document.getElementById('fuelBtn').disabled = (fuel >= 100 || isMining);
    document.getElementById('shieldBtn').disabled = (shield >= 100 || isMining);
}

async function checkLaunch() {
    if (fuel >= 100 && shield >= 100 && !isMining) {
        startMining();
    }
}

async function startMining() {
    isMining = true;
    const now = Date.now();
    const userRef = ref(db, 'users/' + userId);
    
    await update(userRef, { 
        lastLaunch: now,
        isMining: true
    });

    triggerRocketAnimation(true);
    startTimer(10 * 60); // 10 daqiqa
}

function triggerRocketAnimation(active) {
    const r = document.getElementById('rocket');
    if (active) {
        r.classList.add('flying-mode', 'animate__animated', 'animate__bounceInUp');
    } else {
        r.classList.remove('flying-mode', 'animate__animated', 'animate__bounceInUp');
    }
}

function startTimer(seconds) {
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.classList.remove('hidden');
    
    const interval = setInterval(() => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        
        if (seconds <= 0) {
            clearInterval(interval);
            timerDisplay.classList.add('hidden');
            document.getElementById('claimBtn').classList.remove('hidden');
            triggerRocketAnimation(false);
        }
        seconds--;
    }, 1000);
}

window.finalClaim = async () => {
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    if (snap.exists()) {
        const data = snap.val();
        const newBal = (data.balance || 0) + 0.0001;
        
        await update(userRef, {
            balance: newBal,
            isMining: false,
            lastLaunch: null
        });
        
        fuel = 0;
        shield = 0;
        isMining = false;
        document.getElementById('claimBtn').classList.add('hidden');
        updateUI();
        loadUserData();
        window.Telegram.WebApp.showAlert("Success! 0.00005 TON added.");
    }
};

async function loadUserData() {
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    if (snap.exists()) {
        const data = snap.val();
        document.getElementById('balance').innerText = (data.balance || 0).toFixed(6) + " TON";
        
        if (data.isMining && data.lastLaunch) {
            const elapsed = Math.floor((Date.now() - data.lastLaunch) / 1000);
            const remaining = (10 * 60) - elapsed;
            
            if (remaining > 0) {
                fuel = 100; shield = 100;
                isMining = true;
                updateUI();
                triggerRocketAnimation(true);
                startTimer(remaining);
            } else {
                document.getElementById('claimBtn').classList.remove('hidden');
                fuel = 100; shield = 100;
                updateUI();
            }
        }
    }
}

loadUserData();