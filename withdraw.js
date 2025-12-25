import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get, update, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const userId = webApp.initDataUnsafe?.user ? "tg_" + webApp.initDataUnsafe.user.id : (localStorage.getItem('mining_uid') || "guest");

const savedWallet = localStorage.getItem('user_ton_wallet');
if(savedWallet) {
    document.getElementById('walletAddr').value = savedWallet;
}

document.getElementById('withdrawBtn').onclick = async () => {
    const addrInput = document.getElementById('walletAddr');
    const amountInput = document.getElementById('amount');
    const msg = document.getElementById('msg');
    
    const wallet = addrInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (wallet.length < 10 || isNaN(amount) || amount < 0.0001) {
        msg.innerText = "❌ Ma'lumotlarni to'g'ri kiriting!";
        msg.className = "text-center text-red-400 font-medium";
        return;
    }

    try {
        const userRef = ref(db, 'users/' + userId);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            const balance = snapshot.val().balance || 0;
            if (balance < amount) {
                msg.innerText = "❌ Balans yetarli emas!";
                msg.className = "text-center text-red-400 font-medium";
                return;
            }

            msg.innerText = "⏳ Tranzaksiya yuborilmoqda...";

            // --- AVTO TO'LOV QISMI ---
            const client = new Ton.TonClient({
                endpoint: 'https://toncenter.com/api/v2/jsonRPC',
                apiKey: '60134015690b23023e356e9f65d19a287a93a199859344426543b591b68019b1' 
            });

            // BU YERGA O'ZINGIZNING 24 TA SO'ZINGIZNI YOZING
            const mnemonic = "broom moral speak annual believe input palm subway auto harbor about render dilemma when bean course guide flavor obvious defense rural title electric collect"; 
            const keyPair = await TonCrypto.mnemonicToPrivateKey(mnemonic.split(" "));
            
            const myWallet = Ton.WalletContractV4.create({ 
                workchain: 0, 
                publicKey: keyPair.publicKey 
            });

            const contract = client.open(myWallet);
            const seqno = await contract.getSeqno();

            await contract.sendTransfer({
                secretKey: keyPair.secretKey,
                seqno: seqno,
                messages: [
                    Ton.internal({
                        to: wallet,
                        value: Ton.toNano(amount.toString()),
                        bounce: false,
                    })
                ]
            });
            // --------------------------

            localStorage.setItem('user_ton_wallet', wallet);

            const requestRef = push(ref(db, 'withdraw_requests'));
            await set(requestRef, {
                uid: userId,
                address: wallet,
                amount: amount,
                status: 'completed', // Avtomatik bo'lgani uchun completed
                date: new Date().toLocaleString()
            });

            await update(userRef, { balance: balance - amount });
            
            msg.innerText = "✅ Pul hamyonga yuborildi!";
            msg.className = "text-center text-green-400 font-medium";
            amountInput.value = "";
        }
    } catch (err) {
        console.error(err);
        msg.innerText = "❌ Xatolik: " + err.message;
        msg.className = "text-center text-red-400 font-medium";
    }
};