const webApp = window.Telegram.WebApp;
const tgUser = webApp.initDataUnsafe.user;
const userId = tgUser ? "tg_" + tgUser.id : localStorage.getItem('mining_uid');

function getData() {
    const data = localStorage.getItem('data_' + userId);
    return data ? JSON.parse(data) : { referralCount: 0, referralEarnings: 0 };
}

if (userId) {
    const rawId = userId.replace("tg_", "");
    const botUsername = "rocket_mining_bot"; 
    const appName = "mining"; 
    const fullLink = `https://t.me/${botUsername}/${appName}?startapp=${rawId}`;
    document.getElementById('refLink').innerText = fullLink;
}

function loadStats() {
    const data = getData();
    document.getElementById('refCount').innerText = data.referralCount || 0;
    document.getElementById('totalBonus').innerText = (data.referralEarnings || 0).toFixed(6) + " TON";
}

loadStats();
