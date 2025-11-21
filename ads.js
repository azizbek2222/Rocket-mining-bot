// AdsGram SDK init
const AdController = window.Adsgram.init({ blockId: "int-17980" });

document.getElementById('showAdBtn').addEventListener('click', () => {
  AdController.show().then(result => {
    if(result.done && !result.error){
      // Reklama ko‘rildi, balansga 0.02 RUB qo‘shish
      updateBalance(0.02);
      alert("Sizga 0.02 RUB qo‘shildi!");
    }
  }).catch(err => {
    console.error("Reklama xatoligi: ", err);
  }).finally(() => {
    console.log("Reklama tugadi yoki xatolik bo'ldi");
  });
});
