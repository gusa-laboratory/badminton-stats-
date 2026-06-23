/* =========================================================================
   スタッツの保存層（Firebase Realtime Database）
   - 保存先: stats/{team}/matches/{pushId}
   - team（チームの合言葉）で履歴を束ねる。端末ローカルに記憶。
   ========================================================================= */
(function () {
  "use strict";
  const DEFAULT_TEAM = "ojbad";
  const TEAM_KEY = "bdmt:stats:team";

  function sanitize(s) {
    const out = String(s || "").trim().toLowerCase()
      .replace(/[.#$\[\]\/\s]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return out || DEFAULT_TEAM;
  }

  let team = sanitize(localStorage.getItem(TEAM_KEY) || DEFAULT_TEAM);
  let booted = false;
  const readyCbs = [];

  function path() { return "stats/" + team + "/matches"; }

  const Store = {
    get team() { return team; },
    setTeam(t) { team = sanitize(t); localStorage.setItem(TEAM_KEY, team); },
    sanitize,
    whenReady(cb) { if (booted) cb(); else readyCbs.push(cb); },
    _markBooted() { booted = true; readyCbs.splice(0).forEach(c => { try { c(); } catch (e) { console.error(e); } }); },

    // 1試合を保存（push）。Promise<key> を返す。
    saveMatch(rec) {
      const F = window.__FB__;
      if (!F) return Promise.reject(new Error("Firebase未接続"));
      const r = F.push(F.ref(F.db, path()));
      return F.set(r, rec).then(() => r.key);
    },
    // 履歴を購読。cb(matchesObj)
    subscribe(cb) {
      const F = window.__FB__;
      if (!F) { cb({}); return; }
      F.onValue(F.ref(F.db, path()), s => cb(s.val() || {}));
    },
    // 1試合を削除
    deleteMatch(id) {
      const F = window.__FB__;
      if (!F) return Promise.resolve();
      return F.remove(F.ref(F.db, path() + "/" + id));
    }
  };

  window.StatsStore = Store;
})();
