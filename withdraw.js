import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, increment, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

document.getElementById('withdrawBtn').onclick = async () => {
    const addr = document.getElementById('walletAddr').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const msg = document.getElementById('msg');

    if (addr.length < 10 || isNaN(amount) || amount < 0.01) {
        msg.innerText = "❌ Ma'lumotlar xato!";
        return;
    }

    const userRef = ref(db, 'users/' + userId);
    const snap = await get(userRef);
    const userData = snap.val();

    if (userData.balance < amount) {
        msg.innerText = "❌ Balans yetarli emas!";
        return;
    }

    // Balansni kamaytirish
    await update(userRef, { balance: increment(-amount) });

    // Admin uchun so'rov qoldirish
    await push(ref(db, 'withdraw_requests'), {
        uid: userId,
        address: addr,
        amount: amount,
        status: "pending",
        date: new Date().toISOString()
    });

    msg.innerText = "✅ So'rov yuborildi!";
    webApp.showAlert("Withdrawal request sent to admin.");
};
