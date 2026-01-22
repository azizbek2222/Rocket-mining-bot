import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, set, update, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
webApp.ready();

const userId = webApp.initDataUnsafe?.user ? "tg_" + webApp.initDataUnsafe.user.id : "guest";
const adBlockIds = ["int-19356", "int-21586", "int-21587", "int-21588"];

let fuel = 0, shield = 0, isMining = false;

// Foydalanuvchini yuklash va Referal tizimini tekshirish
async function initUser() {
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    
    if (!snap.exists()) {
        const startParam = webApp.initDataUnsafe.start_param; 
        const newUser = {
            balance: 0,
            referralCount: 0,
            referralEarnings: 0,
            referredBy: (startParam && "tg_" + startParam !== userId) ? "tg_" + startParam : null,
            isMining: false,
            lastLaunch: null
        };
        await set(userRef, newUser);

        // Taklif qilgan odamga +1 referal qo'shish
        if (newUser.referredBy) {
            await update(ref(db, 'users/' + newUser.referredBy), {
                referralCount: increment(1)
            });
        }
    }
    loadUserData();
}

async function showAd() {
    const randomBlockId = adBlockIds[Math.floor(Math.random() * adBlockIds.length)];
    const AdController = window.Adsgram ? window.Adsgram.init({ blockId: randomBlockId }) : null;
    if (!AdController) return false;
    try {
        const result = await AdController.show();
        return result.done;
    } catch (e) { return false; }
}

window.refuel = async () => {
    if (fuel < 100 && !isMining && await showAd()) {
        fuel = Math.min(fuel + 50, 100);
        updateUI(); checkLaunch();
    }
};

window.chargeShield = async () => {
    if (shield < 100 && !isMining && await showAd()) {
        shield = Math.min(shield + 50, 100);
        updateUI(); checkLaunch();
    }
};

function checkLaunch() {
    if (fuel >= 100 && shield >= 100 && !isMining) startMining();
}

async function startMining() {
    isMining = true;
    const now = Date.now();
    await update(ref(db, 'users/' + userId), { lastLaunch: now, isMining: true });
    triggerRocketAnimation(true);
    startTimer(10 * 60);
}

window.finalClaim = async () => {
    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    const data = snap.val();
    const amount = 0.0001;

    // Asosiy balansni oshirish
    await update(userRef, {
        balance: increment(amount),
        isMining: false,
        lastLaunch: null
    });

    // Referalga 2% bonus berish
    if (data.referredBy) {
        const bonus = amount * 0.02;
        await update(ref(db, 'users/' + data.referredBy), {
            balance: increment(bonus),
            referralEarnings: increment(bonus)
        });
    }

    fuel = 0; shield = 0; isMining = false;
    document.getElementById('claimBtn').classList.add('hidden');
    triggerRocketAnimation(false);
    loadUserData();
    updateUI();
    webApp.showAlert("Success! 0.0001 TON added.");
};

function startTimer(seconds) {
    const timerDisplay = document.getElementById('timerDisplay');
    timerDisplay.classList.remove('hidden');
    const interval = setInterval(() => {
        const m = Math.floor(seconds / 60), s = seconds % 60;
        timerDisplay.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (seconds-- <= 0) {
            clearInterval(interval);
            timerDisplay.classList.add('hidden');
            document.getElementById('claimBtn').classList.remove('hidden');
        }
    }, 1000);
}

async function loadUserData() {
    const snap = await get(ref(db, 'users/' + userId));
    if (snap.exists()) {
        const data = snap.val();
        document.getElementById('balance').innerText = (data.balance || 0).toFixed(6) + " TON";
        
        if (data.isMining && data.lastLaunch) {
            const elapsed = Math.floor((Date.now() - data.lastLaunch) / 1000);
            const remaining = 600 - elapsed;
            if (remaining > 0) {
                fuel = 100; shield = 100; isMining = true;
                updateUI(); triggerRocketAnimation(true); startTimer(remaining);
            } else {
                document.getElementById('claimBtn').classList.remove('hidden');
            }
        }
    }
}

function triggerRocketAnimation(active) {
    const r = document.getElementById('rocket');
    active ? r.classList.add('flying-mode') : r.classList.remove('flying-mode');
}

function updateUI() {
    document.getElementById('fuelFill').style.width = fuel + "%";
    document.getElementById('shieldFill').style.width = shield + "%";
}

initUser();
