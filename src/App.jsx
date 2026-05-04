import { useState, useEffect, useCallback } from "react";
import { scanDirectory } from "./utils/scanner";
import { detectDiff } from "./utils/diff";
import { initDB, saveSnapshot, saveChange, getSnapshots } from "./utils/db";
import Summary from "./components/Summary";
import FileList from "./components/FileList";
import CodeDiff from "./components/CodeDiff";
import Toast from "./components/Toast";
import styles from "./App.module.css";

// File System Access API の対応確認
const FS_API_SUPPORTED = "showDirectoryPicker" in window;

// ステップ定義
const STEPS = {
  IDLE: "idle",
  BEFORE_LOADED: "before_loaded",
  AFTER_LOADED: "after_loaded",
  DIFFED: "diffed",
};

export default function App() {
  const [step, setStep] = useState(STEPS.IDLE);
  const [beforeMap, setBeforeMap] = useState(null);
  const [afterMap, setAfterMap] = useState(null);
  const [diffResult, setDiffResult] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(null); // "before" | "after" | "diff"
  const [snapshots, setSnapshots] = useState([]);
  const [toast, setToast] = useState(null);
  const [dbReady, setDbReady] = useState(false);

  // DB 初期化
  useEffect(() => {
    initDB()
      .then(() => {
        setDbReady(true);
        return getSnapshots();
      })
      .then(setSnapshots)
      .catch((err) => console.error("DB init error:", err));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ──────────────────────────────────────────
  // Before フォルダ読み込み
  // ──────────────────────────────────────────
  const pickBefore = async () => {
    if (!FS_API_SUPPORTED) {
      return showToast("このブラウザは File System Access API に対応していません", "error");
    }
    try {
      setLoading("before");
      const dirHandle = await window.showDirectoryPicker();
      const map = await scanDirectory(dirHandle);
      setBeforeMap(map);
      setAfterMap(null);
      setDiffResult(null);
      setSelectedPath(null);
      setStep(STEPS.BEFORE_LOADED);

      // スナップショット保存
      if (dbReady) {
        const snapshot = {
          id: "snapshot_" + Date.now(),
          createdAt: Date.now(),
          label: dirHandle.name,
          files: Object.fromEntries(
            Object.entries(map).map(([path, v]) => [
              path,
              { hash: v.hash, size: v.size, role: v.role },
            ])
          ),
        };
        await saveSnapshot(snapshot);
        const snaps = await getSnapshots();
        setSnapshots(snaps);
      }

      showToast(`${Object.keys(map).length} ファイルを読み込みました`, "success");
    } catch (err) {
      if (err.name !== "AbortError") {
        showToast("読み込みエラー: " + err.message, "error");
      }
    } finally {
      setLoading(null);
    }
  };

  // ──────────────────────────────────────────
  // After フォルダ読み込み
  // ──────────────────────────────────────────
  const pickAfter = async () => {
    if (!FS_API_SUPPORTED) return;
    try {
      setLoading("after");
      const dirHandle = await window.showDirectoryPicker();
      const map = await scanDirectory(dirHandle);
      setAfterMap(map);
      setDiffResult(null);
      setSelectedPath(null);
      setStep(STEPS.AFTER_LOADED);
      showToast(`${Object.keys(map).length} ファイルを読み込みました`, "success");
    } catch (err) {
      if (err.name !== "AbortError") {
        showToast("読み込みエラー: " + err.message, "error");
      }
    } finally {
      setLoading(null);
    }
  };

  // ──────────────────────────────────────────
  // 差分検出
  // ──────────────────────────────────────────
  const runDiff = async () => {
    if (!beforeMap || !afterMap) return;
    setLoading("diff");
    try {
      const result = detectDiff(beforeMap, afterMap);
      setDiffResult(result);
      setSelectedPath(null);
      setStep(STEPS.DIFFED);

      // 変更ファイルのコードをDB保存（切り戻し用）
      if (dbReady) {
        for (const path of result.changed) {
          const bc = beforeMap[path]?.content;
          const ac = afterMap[path]?.content;
          if (bc && ac) {
            await saveChange(path, bc, ac);
          }
        }
      }

      const total = result.added.length + result.removed.length + result.changed.length;
      showToast(`差分検出完了: ${total} 件の変更`, "success");
    } catch (err) {
      showToast("差分検出エラー: " + err.message, "error");
    } finally {
      setLoading(null);
    }
  };

  // ──────────────────────────────────────────
  // リセット
  // ──────────────────────────────────────────
  const reset = () => {
    setBeforeMap(null);
    setAfterMap(null);
    setDiffResult(null);
    setSelectedPath(null);
    setStep(STEPS.IDLE);
  };

  // ──────────────────────────────────────────
  // レンダリング
  // ──────────────────────────────────────────
  return (
    <div className={styles.app}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⚡</span>
            <span className={styles.logoText}>VibeDiff</span>
            <span className={styles.logoTag}>POC</span>
          </div>
          <p className={styles.tagline}>バイブコーディングの変更を構造的に理解する</p>
        </div>
      </header>

      <main className={styles.main}>
        {/* 非対応ブラウザ警告 */}
        {!FS_API_SUPPORTED && (
          <div className={styles.unsupported}>
            ⚠️ このブラウザは File System Access API に対応していません。<br />
            Chrome / Edge 最新版をお使いください。
          </div>
        )}

        {/* ─── ステップUI ─── */}
        <div className={styles.steps}>
          {/* STEP 1: Before */}
          <div className={`${styles.stepCard} ${step !== STEPS.IDLE || beforeMap ? styles.stepActive : ""}`}>
            <div className={styles.stepNum}>①</div>
            <div className={styles.stepBody}>
              <div className={styles.stepTitle}>変更前フォルダ</div>
              <div className={styles.stepDesc}>
                {beforeMap
                  ? `✅ ${Object.keys(beforeMap).length} ファイル読み込み済み`
                  : "AIでコードを変更する前のフォルダを選択"}
              </div>
            </div>
            <button
              className={`${styles.stepBtn} ${beforeMap ? styles.stepBtnDone : styles.stepBtnPrimary}`}
              onClick={pickBefore}
              disabled={loading !== null}
            >
              {loading === "before" ? "読み込み中..." : beforeMap ? "再選択" : "選択する"}
            </button>
          </div>

          <div className={styles.stepArrow}>→</div>

          {/* STEP 2: After */}
          <div className={`${styles.stepCard} ${step === STEPS.AFTER_LOADED || step === STEPS.DIFFED ? styles.stepActive : ""} ${!beforeMap ? styles.stepDisabled : ""}`}>
            <div className={styles.stepNum}>②</div>
            <div className={styles.stepBody}>
              <div className={styles.stepTitle}>変更後フォルダ</div>
              <div className={styles.stepDesc}>
                {afterMap
                  ? `✅ ${Object.keys(afterMap).length} ファイル読み込み済み`
                  : "AIでコードを変更した後のフォルダを選択"}
              </div>
            </div>
            <button
              className={`${styles.stepBtn} ${afterMap ? styles.stepBtnDone : styles.stepBtnPrimary}`}
              onClick={pickAfter}
              disabled={!beforeMap || loading !== null}
            >
              {loading === "after" ? "読み込み中..." : afterMap ? "再選択" : "選択する"}
            </button>
          </div>

          <div className={styles.stepArrow}>→</div>

          {/* STEP 3: 比較 */}
          <div className={`${styles.stepCard} ${step === STEPS.DIFFED ? styles.stepActive : ""} ${!afterMap ? styles.stepDisabled : ""}`}>
            <div className={styles.stepNum}>③</div>
            <div className={styles.stepBody}>
              <div className={styles.stepTitle}>差分検出</div>
              <div className={styles.stepDesc}>
                {diffResult
                  ? `✅ ${diffResult.changed.length + diffResult.added.length + diffResult.removed.length} 件の変更を検出`
                  : "2つのフォルダを比較して差分を検出する"}
              </div>
            </div>
            <button
              className={`${styles.stepBtn} ${diffResult ? styles.stepBtnDone : styles.stepBtnAccent}`}
              onClick={runDiff}
              disabled={!beforeMap || !afterMap || loading !== null}
            >
              {loading === "diff" ? "解析中..." : diffResult ? "再比較" : "比較する"}
            </button>
          </div>

          {step !== STEPS.IDLE && (
            <button className={styles.resetBtn} onClick={reset} title="リセット">
              ↺
            </button>
          )}
        </div>

        {/* ─── スナップショット履歴 ─── */}
        {snapshots.length > 0 && (
          <div className={styles.snapshots}>
            <div className={styles.snapshotTitle}>📸 スナップショット履歴</div>
            <div className={styles.snapshotList}>
              {snapshots.slice(0, 5).map((s) => (
                <div key={s.id} className={styles.snapshotItem}>
                  <span className={styles.snapshotLabel}>{s.label}</span>
                  <span className={styles.snapshotDate}>
                    {new Date(s.createdAt).toLocaleString("ja-JP", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={styles.snapshotCount}>
                    {Object.keys(s.files).length} files
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── 差分結果 ─── */}
        {diffResult && (
          <div className={styles.results}>
            <Summary
              diffResult={diffResult}
              beforeMap={beforeMap}
              afterMap={afterMap}
            />

            <FileList
              diffResult={diffResult}
              beforeMap={beforeMap}
              afterMap={afterMap}
              onSelect={(path) =>
                setSelectedPath((prev) => (prev === path ? null : path))
              }
              selected={selectedPath}
              canRestore={dbReady}
            />

            {selectedPath && (
              <CodeDiff
                path={selectedPath}
                beforeContent={beforeMap[selectedPath]?.content}
                afterContent={afterMap[selectedPath]?.content}
                onClose={() => setSelectedPath(null)}
              />
            )}
          </div>
        )}

        {/* ─── 空状態 ─── */}
        {step === STEPS.IDLE && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h2 className={styles.emptyTitle}>VibeDiff へようこそ</h2>
            <p className={styles.emptyDesc}>
              AIでコードを変更する前後のフォルダを選んで比較するだけ。<br />
              Gitがなくても、何が変わったか即座に把握できます。
            </p>
            <div className={styles.features}>
              {[
                { icon: "📂", text: "フォルダ丸ごと比較" },
                { icon: "🎯", text: "重要ファイルを優先表示" },
                { icon: "↩️", text: "ワンクリックで元に戻す" },
                { icon: "💾", text: "スナップショット自動保存" },
              ].map((f) => (
                <div key={f.text} className={styles.featureItem}>
                  <span>{f.icon}</span>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
