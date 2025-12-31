import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Firebase sozlamalari
const firebaseConfig = {
    apiKey: "AIzaSyDIeG8dVbm0Yk7FR1hPzrBoD7rgDKWAFoY",
    authDomain: "user1111-c84a0.firebaseapp.com",
    databaseURL: "https://user1111-c84a0-default-rtdb.firebaseio.com",
    projectId: "user1111-c84a0",
    storageBucket: "user1111-c84a0.firebasestorage.app",
    messagingSenderId: "901723757936",
    appId: "1:901723757936:web:9da0a1c7ec494f4a0c03b5"
};

// Firebase-ni ishga tushirish
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const webApp = window.Telegram.WebApp;
webApp.ready();

// Foydalanuvchi ID sini aniqlash
const userId = webApp.initDataUnsafe?.user ? "tg_" + webApp.initDataUnsafe.user.id : (localStorage.getItem('mining_uid') || "guest");

// Avval saqlangan hamyonni yuklash
const savedWallet = localStorage.getItem('user_ton_wallet');
if(savedWallet) {
    document.getElementById('walletAddr').value = savedWallet;
}

// Tugma bosilganda ishlash
document.getElementById('withdrawBtn').onclick = async () => {
    const addrInput = document.getElementById('walletAddr');
    const amountInput = document.getElementById('amount');
    const msg = document.getElementById('msg');
    
    const wallet = addrInput.value.trim();
    const amount = parseFloat(amountInput.value);

    // Tekshiruvlar
    if (wallet.length < 10) {
        msg.innerText = "❌ Enter the wallet address correctly.!";
        msg.className = "text-center text-red-400 font-medium";
        return;
    }

    if (isNaN(amount) || amount < 0.01) {
        msg.innerText = "❌ Minimum quantity 0.01 TON";
        msg.className = "text-center text-red-400 font-medium";
        return;
    }

    try {
        const userRef = ref(db, 'users/' + userId);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const balance = snapshot.val().balance || 0;
            if (balance < amount) {
                msg.innerText = "❌ Insufficient balance!";
                msg.className = "text-center text-red-400 font-medium";
                return;
            }

            // Hamyonni xotiraga saqlab qo'yish
            localStorage.setItem('user_ton_wallet', wallet);

            // Firebase'ga so'rov yuborish
            const requestRef = push(ref(db, 'withdraw_requests'));
            await set(requestRef, {
                uid: userId,
                address: wallet,
                amount: amount,
                status: 'pending',
                date: new Date().toLocaleString()
            });

            // Balansni yangilash
            await update(userRef, { balance: balance - amount });
            
            msg.innerText = "✅ Request sent successfully.!";
            msg.className = "text-center text-green-400 font-medium";
            amountInput.value = "";
        }
    } catch (err) {
        msg.innerText = "❌ Error: " + err.message;
        msg.className = "text-center text-red-400 font-medium";
    }
};