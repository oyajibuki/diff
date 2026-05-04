import { useState, useCallback } from "react";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import { getChange, saveChange } from "../utils/db";
import styles from "./RestoreButton.module.css";

export default function RestoreButton({ path, fileHandle, onRestored }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [restored, setRestored] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleRestore = async () => {
    setLoading(true);
    try {
      const change = await getChange(path);
      if (!change) {
        showToast("復元データが見つかりません", "error");
        setModalOpen(false);
        return;
      }

      // ① 現在のコードをバックアップ保存
      const file = await fileHandle.getFile();
      const currentCode = await file.text();
      await saveChange(path + "__backup__", currentCode, change.beforeCode);

      // ② beforeCode で上書き
      const writable = await fileHandle.createWritable();
      await writable.write(change.beforeCode);
      await writable.close();

      setRestored(true);
      setModalOpen(false);
      showToast("復元しました ✨", "success");
      if (onRestored) onRestored(path);
    } catch (err) {
      console.error(err);
      showToast("復元に失敗しました: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!fileHandle) return null;

  return (
    <>
      <button
        className={`${styles.btn} ${restored ? styles.restored : ""}`}
        onClick={() => setModalOpen(true)}
        disabled={restored || loading}
        title={restored ? "復元済み" : "このファイルを元に戻す"}
      >
        {restored ? "✅ 復元済み" : loading ? "復元中..." : "↩ 元に戻す"}
      </button>

      <ConfirmModal
        open={modalOpen}
        onConfirm={handleRestore}
        onCancel={() => setModalOpen(false)}
        file={path}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
