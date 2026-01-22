const webApp = window.Telegram.WebApp;
const userId = webApp.initDataUnsafe?.user ? "tg_" + webApp.initDataUnsafe.user.id : (localStorage.getItem('mining_uid') || "guest");

function getData() {
    const data = localStorage.getItem('data_' + userId);
    return data ? JSON.parse(data) : { balance: 0 };
}

function saveData(data) {
    localStorage.setItem('data_' + userId, JSON.stringify(data));
}

const savedWallet = localStorage.getItem('user_ton_wallet');
if(savedWallet) {
    document.getElementById('walletAddr').value = savedWallet;
}

document.getElementById('withdrawBtn').onclick = () => {
    const addrInput = document.getElementById('walletAddr');
    const amountInput = document.getElementById('amount');
    const msg = document.getElementById('msg');
    
    const wallet = addrInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (wallet.length < 10) {
        msg.innerText = "❌ Enter correct wallet address!";
        msg.className = "text-center text-red-400 font-medium";
        return;
    }

    if (isNaN(amount) || amount < 0.01) {
        msg.innerText = "❌ Min quantity 0.01 TON";
        msg.className = "text-center text-red-400 font-medium";
        return;
    }

    let userState = getData();
    if (userState.balance < amount) {
        msg.innerText = "❌ Insufficient balance!";
        msg.className = "text-center text-red-400 font-medium";
        return;
    }

    // Balansni kamaytirish va saqlash
    userState.balance -= amount;
    saveData(userState);
    localStorage.setItem('user_ton_wallet', wallet);

    msg.innerText = "✅ Request submitted (Local Mode)";
    msg.className = "text-center text-green-400 font-medium";
    amountInput.value = "";
    
    // Telegramga xabar yuborish (ixtiyoriy)
    webApp.showAlert("Withdrawal request recorded locally.");
};
