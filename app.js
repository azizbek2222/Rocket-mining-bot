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
const botToken = "8106213930:AAHzObkRHkBIQObLxMPW-Ctl0WMFbmpupmI";
let isNotificationSent = false; // 10 soniya qolganida xabar uchun flag

// REKLAMA QISMI
const AdController = window.Adsgram ? window.Adsgram.init({ blockId: "int-19356" }) : null;

function getReferrerId() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.start_param) {
        return "tg_" + window.Telegram.WebApp.initDataUnsafe.start_param;
    }
    return null;
}

const referrerId = getReferrerId();

async function sendTelegramMessage(text) {
    const chatId = userId.replace("tg_", "");
    if (!isNaN(chatId)) {
        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    parse_mode: "HTML"
                })
            });
        } catch (err) {
            console.error("Telegram xabar yuborishda xatolik:", err);
        }
    }
}

async function checkFirstTimeEntry() {
    const userRef = ref(db, 'users/' + userId);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
        const welcomeText = "👋 <b>Welcome!</b>\n\nYou have successfully logged in to the Rocket Mining app. Get rewards every 5 minutes and collect TON! 🚀";
        await sendTelegramMessage(welcomeText);
    }
}

async function handleClaim() {
    if (!AdController) {
        window.Telegram.WebApp.showAlert("The ad failed to load. Please wait a moment or refresh the page..");
        return;
    }

    try {
        const result = await AdController.show();
        
        if (result && result.done) {
            startRocketAnimation();
            const userRef = ref(db, 'users/' + userId);
            const snapshot = await get(userRef);
            const now = Date.now();
            const reward = 0.0001;
            const bonusPercent = 0.02;

            if (snapshot.exists()) {
                const data = snapshot.val();
                if (now - data.lastClaim < 5 * 60 * 1000) { 
                    window.Telegram.WebApp.showAlert("Please wait!"); 
                    return; 
                }
                
                await update(userRef, { 
                    balance: (data.balance || 0) + reward, 
                    lastClaim: now 
                });

                if (data.invitedBy) {
                    const bossRef = ref(db, 'users/' + data.invitedBy);
                    const bossSnap = await get(bossRef);
                    if (bossSnap.exists()) {
                        const bossData = bossSnap.val();
                        const bonusAmount = reward * bonusPercent;
                        await update(bossRef, { 
                            balance: (bossData.balance || 0) + bonusAmount,
                            referralEarnings: (bossData.referralEarnings || 0) + bonusAmount
                        });
                    }
                }
            } else {
                const newUserObj = { 
                    balance: reward, 
                    lastClaim: now,
                    invitedBy: referrerId,
                    referralCount: 0,
                    referralEarnings: 0
                };
                await set(userRef, newUserObj);

                if (referrerId && referrerId !== userId) {
                    const bossRef = ref(db, 'users/' + referrerId);
                    const bossSnap = await get(bossRef);
                    if (bossSnap.exists()) {
                        const bossData = bossSnap.val();
                        const bonusAmount = reward * bonusPercent;
                        await update(bossRef, { 
                            referralCount: (bossData.referralCount || 0) + 1,
                            balance: (bossData.balance || 0) + bonusAmount,
                            referralEarnings: (bossData.referralEarnings || 0) + bonusAmount
                        });
                    }
                }
            }
            
            isNotificationSent = false; // Taymerni qayta boshlash uchun reset
            loadUserData();
        } else {
            window.Telegram.WebApp.showAlert("You must watch the ad to the end to receive the reward..");
        }
    } catch (e) { 
        window.Telegram.WebApp.showAlert("There are no ads available at this time. Please try again later.."); 
        console.error(e); 
    }
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
        document.getElementById('balance').innerText = (data.balance || 0).toFixed(6) + " TON";
        checkTimer(data.lastClaim);
    }
}

function checkTimer(lastClaim) {
    if (!lastClaim) return;
    const btn = document.getElementById('claimBtn');
    const timerDiv = document.getElementById('timer');
    const interval = setInterval(() => {
        const diff = (5 * 60 * 1000) - (Date.now() - lastClaim);
        
        if (diff <= 0) {
            btn.disabled = false; 
            btn.innerText = "CLAIM 0.0001 TON";
            timerDiv.classList.add('hidden'); 
            clearInterval(interval);
            const reminderText = "🚀 <b>It's time!</b>\n\nYour rocket is ready. Don't forget to claim it!";
            sendTelegramMessage(reminderText);
        } else {
            btn.disabled = true; 
            timerDiv.classList.remove('hidden');
            const m = Math.floor(diff / 60000), s = Math.floor((diff % 60000) / 1000);
            timerDiv.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;

            // 10 soniya qolganida ogohlantirish yuborish
            if (diff <= 10000 && !isNotificationSent) {
                isNotificationSent = true;
                const soonText = "⚠️ <b>Attention!</b>\n\nOnly 10 seconds left until your next claim! Get ready. 🚀";
                sendTelegramMessage(soonText);
            }
        }
    }, 1000);
}

window.handleClaim = handleClaim;
checkFirstTimeEntry();
loadUserData();
