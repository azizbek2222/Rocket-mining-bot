// AdsGram SDK init
const AdController = window.Adsgram.init({ blockId: "int-17980" });

document.getElementById('showAdBtn').addEventListener('click', () => {

  console.log("Reklama ochilmoqda...");

  AdController.show()

    .then(result => {
      console.log("Reklama natijasi:", result);

      // DONE TRUE bo'lsa — balans qo‘shamiz
      if (result.done && !result.error) {
        console.log("Reklama tomosha qilindi — balans qo‘shilmoqda...");
        updateBalance(0.02);
        alert("Sizga 0.02 RUB qo‘shildi!");
      } else {
        console.log("Reklama oxiriga yetkazilmadi!");
      }

    })

    .catch(err => {
      console.log("Reklama xatoligi:", err);
    })

    .finally(() => {
      console.log("Reklama yakunlandi.");
    });

});
