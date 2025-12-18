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

function getUserId() {
    let id = "";
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.user) {
        id = "tg_" + window.Telegram.WebApp.initDataUnsafe.user.id;
    } else {
        id = localStorage.getItem('mining_uid') || "user_" + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('mining_uid', id);
    }
    return id;
}

const userId = getUserId();
const AdController = window.Adsgram.init({ blockId: "int-19304" });

// Referalni aniqlash
function getReferrerId() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.start_param) {
        return "tg_" + window.Telegram.WebApp.initDataUnsafe.start_param;
    }
    return null;
}

const referrerId = getReferrerId();

async function handleClaim() {
    try {
        const result = await AdController.show();
        if (result.done) {
            startRocketAnimation();
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            const now = Date.now();
            const reward = 0.0001; // Har bir claim uchun foydalanuvchiga beriladigan miqdor
            const bonusPercent = 0.02; // 2% Referal bonus

            if (snapshot.exists()) {
                const data = snapshot.val();
                if (now - data.lastClaim < 30 * 60 * 1000) { alert("Kuting!"); return; }
                
                // 1. Foydalanuvchining o'z balansini yangilash
                await update(userRef, { 
                    balance: (data.balance || 0) + reward, 
                    lastClaim: now 
                });

                // 2. Taklif qilgan odamga (referrer) 2% bonus berish
                if (data.invitedBy) {
                    const bossRef = ref(db, 'users/' + data.invitedBy);
                    const bossSnap = await get(bossRef);
                    if (bossSnap.exists()) {
                        const bossData = bossSnap.val();
                        const bonusAmount = reward * bonusPercent; // Masalan: 0.0001 * 0.02 = 0.000002
                        
                        await update(bossRef, { 
                            balance: (bossData.balance || 0) + bonusAmount,
                            referralEarnings: (bossData.referralEarnings || 0) + bonusAmount
                        });
                    }
                }
            } else {
                // Yangi foydalanuvchi birinchi marta CLAIM qilganda
                const newUserObj = { 
                    balance: reward, 
                    lastClaim: now,
                    invitedBy: referrerId,
                    referralCount: 0,
                    referralEarnings: 0
                };
                await set(userRef, newUserObj);

                // Taklif qilgan odamning statistikasini yangilash (Count +1)
                if (referrerId && referrerId !== userId) {
                    const bossRef = ref(db, 'users/' + referrerId);
                    const bossSnap = await get(bossRef);
                    if (bossSnap.exists()) {
                        const bossData = bossSnap.val();
                        // Yangi referal uchun 2% bonusni ham shu zahoti berish
                        const bonusAmount = reward * bonusPercent;
                        
                        await update(bossRef, { 
                            referralCount: (bossData.referralCount || 0) + 1,
                            balance: (bossData.balance || 0) + bonusAmount,
                            referralEarnings: (bossData.referralEarnings || 0) + bonusAmount
                        });
                    }
                }
            }
            loadUserData();
        }
    } catch (e) { alert("Reklama yuklanmadi!"); console.error(e); }
}

function startRocketAnimation() {
    const rocket = document.getElementById('rocket');
    rocket.classList.add('flying', 'animate__animated', 'animate__bounceOutUp');
    setTimeout(() => {
        rocket.classList.remove('animate__bounceOutUp');
        rocket.classList.add('animate__bounceInDown');
    }, 2000);
}

async function loadUserData() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        // UI da ko'proq raqamlarni ko'rish uchun toFixed(6) qilindi
        document.getElementById('balance').innerText = (data.balance || 0).toFixed(6) + " TON";
        checkTimer(data.lastClaim);
    }
}

function checkTimer(lastClaim) {
    if (!lastClaim) return;
    const btn = document.getElementById('claimBtn');
    const timerDiv = document.getElementById('timer');
    const interval = setInterval(() => {
        const diff = (30 * 60 * 1000) - (Date.now() - lastClaim);
        if (diff <= 0) {
            btn.disabled = false; btn.innerText = "CLAIM 0.0001 TON";
            timerDiv.classList.add('hidden'); clearInterval(interval);
        } else {
            btn.disabled = true; timerDiv.classList.remove('hidden');
            const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
            timerDiv.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
    }, 1000);
}

window.handleClaim = handleClaim;
loadUserData();