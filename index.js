// Telegram WebApp sozlamalari
const webApp = window.Telegram.WebApp;
webApp.ready();
webApp.expand();

const userId = getUserId();
const AdController = window.Adsgram ? window.Adsgram.init({ blockId: "int-19356" }) : null;

// Holatni boshqarish
let fuel = 0;
let shield = 0;
let isMining = false;

function getUserId() {
    if (webApp.initDataUnsafe?.user) {
        return "tg_" + webApp.initDataUnsafe.user.id;
    }
    let id = localStorage.getItem('mining_uid') || "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('mining_uid', id);
    return id;
}

// Lokal bazadan yuklash
function getData() {
    const data = localStorage.getItem('data_' + userId);
    return data ? JSON.parse(data) : { balance: 0, referralCount: 0, referralEarnings: 0, lastLaunch: null, isMining: false };
}

// Lokal bazaga saqlash
function saveData(data) {
    localStorage.setItem('data_' + userId, JSON.stringify(data));
}

window.refuel = async () => {
    if (fuel >= 100 || isMining) return;
    const res = await showAd();
    if (res) {
        fuel = Math.min(fuel + 50, 100);
        updateUI();
        checkLaunch();
    }
};

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
        // Test rejimi uchun reklamasiz ham ishlash (agar AdController bo'lmasa)
        return true; 
    }
    try {
        const result = await AdController.show();
        return result.done;
    } catch (e) {
        webApp.showAlert("No ads available, but proceeding...");
        return true;
    }
}

function updateUI() {
    document.getElementById('fuelFill').style.width = fuel + "%";
    document.getElementById('shieldFill').style.width = shield + "%";
    
    document.getElementById('fuelBtn').disabled = (fuel >= 100 || isMining);
    document.getElementById('shieldBtn').disabled = (shield >= 100 || isMining);
}

function checkLaunch() {
    if (fuel >= 100 && shield >= 100 && !isMining) {
        startMining();
    }
}

function startMining() {
    isMining = true;
    const now = Date.now();
    let userState = getData();
    
    userState.lastLaunch = now;
    userState.isMining = true;
    saveData(userState);

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
    let userState = getData();
    userState.balance = (userState.balance || 0) + 0.0001;
    userState.isMining = false;
    userState.lastLaunch = null;
    
    saveData(userState);
    
    fuel = 0;
    shield = 0;
    isMining = false;
    document.getElementById('claimBtn').classList.add('hidden');
    updateUI();
    loadUserData();
    webApp.showAlert("Success! 0.0001 TON added.");
};

function loadUserData() {
    const userState = getData();
    document.getElementById('balance').innerText = (userState.balance || 0).toFixed(6) + " TON";
    
    if (userState.isMining && userState.lastLaunch) {
        const elapsed = Math.floor((Date.now() - userState.lastLaunch) / 1000);
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

loadUserData();
