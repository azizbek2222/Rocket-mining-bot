import { supabase, userId } from './supabase.js';

// Foydalanuvchi balansini olish va ekranga chiqarish
export async function loadBalance() {
    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

    let bal = 0;
    if(error){
        console.log("Get balance error:", error);
    } else if(data){
        bal = data.balance || 0;
    }

    document.getElementById('balance').innerText = bal.toFixed(2);
}

// Balansga pul qo‘shish
export async function addBalance(amount){
    // Foydalanuvchi mavjudmi tekshirish
    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('id', userId)
        .single();

    if(!data){
        // Yangi foydalanuvchi yaratish
        const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: userId, balance: amount }]);
        if(insertError) console.log("Insert error:", insertError);
    } else {
        const newBalance = (data.balance || 0) + amount;
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', userId);
        if(updateError) console.log("Update error:", updateError);
    }

    loadBalance();
}

// Dastlabki balansni yuklash
loadBalance();
