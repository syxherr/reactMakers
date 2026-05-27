// const cache = {};

// export function suspend(key) {
//   if (cache[key] === "done") return; // ← sudah selesai, langsung return

//   if (!cache[key]) {
//     const promise = new Promise((resolve) => {
//       setTimeout(() => {
//         cache[key] = "done";
//         resolve();
//       }, 0);
//     });
//     cache[key] = promise; // ← simpan Promise-nya, bukan string "pending"
//   }

//   throw cache[key]; // ← lempar Promise ke Suspense
// }