import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({ open, onConfirm, onCancel, file }) {
  if (!open) return null;

  const shortName = file ? file.split("/").pop() : "";

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.icon}>⚠️</div>
        <h3 className={styles.title}>このファイルを元に戻しますか？</h3>
        <p className={styles.filename}>{shortName}</p>
        <p className={styles.warning}>
          現在の変更は上書きされます。<br />
          <span className={styles.safe}>（現在のコードは自動バックアップされます）</span>
        </p>
        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            キャンセル
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            元に戻す
          </button>
        </div>
      </div>
    </div>
  );
}
