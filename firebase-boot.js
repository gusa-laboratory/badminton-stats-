/* =========================================================================
   Firebase 起動。SDK を読み込み window.__FB__ を用意して StatsStore に通知。
   設定が無い/読込失敗時はクラウド機能なし（保存・履歴は使えない）でフォールバック。
   ※ ES module（defer 実行）。classic スクリプト（config→store→本体）の後に動く。
   ========================================================================= */
const SDK = "https://www.gstatic.com/firebasejs/10.12.0";

async function boot() {
  const cfg = window.FIREBASE_CONFIG;
  if (cfg) {
    try {
      const appMod = await import(`${SDK}/firebase-app.js`);
      const dbMod  = await import(`${SDK}/firebase-database.js`);
      const app = appMod.initializeApp(cfg);
      window.__FB__ = {
        db: dbMod.getDatabase(app),
        ref: dbMod.ref,
        push: dbMod.push,
        set: dbMod.set,
        get: dbMod.get,
        onValue: dbMod.onValue,
        remove: dbMod.remove
      };
    } catch (e) {
      console.warn("Firebase の読み込みに失敗。クラウド保存/履歴は使えません。", e);
    }
  }
  if (window.StatsStore) window.StatsStore._markBooted();
}

boot();

// PWA: Service Worker 登録（ホーム画面追加・オフライン対応）
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(e => console.warn("SW登録失敗", e));
}
