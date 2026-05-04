// IndexedDB ラッパー（外部ライブラリ不使用）

const DB_NAME = "vibediff-db";
const DB_VERSION = 1;

let db = null;

/** DB初期化 */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const database = e.target.result;

      if (!database.objectStoreNames.contains("snapshots")) {
        const snapshotStore = database.createObjectStore("snapshots", { keyPath: "id" });
        snapshotStore.createIndex("createdAt", "createdAt");
      }

      if (!database.objectStoreNames.contains("changes")) {
        const changeStore = database.createObjectStore("changes", { keyPath: "path" });
        changeStore.createIndex("savedAt", "savedAt");
      }
    };

    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = (e) => reject(e.target.error);
  });
}

function getDB() {
  if (!db) throw new Error("DB が初期化されていません。initDB() を呼んでください。");
  return db;
}

// ─── Snapshots ───────────────────────────────────────────────

/** スナップショット保存 */
export function saveSnapshot(snapshot) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("snapshots", "readwrite");
    tx.objectStore("snapshots").put(snapshot);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

/** スナップショット一覧取得 */
export function getSnapshots() {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("snapshots", "readonly");
    const req = tx.objectStore("snapshots").getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.createdAt - a.createdAt));
    req.onerror = (e) => reject(e.target.error);
  });
}

/** スナップショット削除 */
export function deleteSnapshot(id) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("snapshots", "readwrite");
    tx.objectStore("snapshots").delete(id);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

// ─── Changes (切り戻し用コード) ─────────────────────────────

/**
 * 変更ファイルのbeforeコードを保存
 * @param {string} path
 * @param {string} beforeCode
 * @param {string} afterCode
 */
export function saveChange(path, beforeCode, afterCode) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("changes", "readwrite");
    tx.objectStore("changes").put({ path, beforeCode, afterCode, savedAt: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

/** 特定パスの変更取得 */
export function getChange(path) {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("changes", "readonly");
    const req = tx.objectStore("changes").get(path);
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/** 全変更取得 */
export function getAllChanges() {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("changes", "readonly");
    const req = tx.objectStore("changes").getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/** 変更データ全削除 */
export function clearChanges() {
  return new Promise((resolve, reject) => {
    const tx = getDB().transaction("changes", "readwrite");
    tx.objectStore("changes").clear();
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}
