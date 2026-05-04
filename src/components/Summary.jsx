import styles from "./Summary.module.css";

export default function Summary({ diffResult, beforeMap, afterMap }) {
  const totalFiles =
    new Set([...Object.keys(beforeMap ?? {}), ...Object.keys(afterMap ?? {})]).size;

  const stats = [
    {
      label: "変更",
      count: diffResult.changed.length,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
      icon: "✏️",
    },
    {
      label: "追加",
      count: diffResult.added.length,
      color: "#34d399",
      bg: "rgba(52,211,153,0.1)",
      icon: "➕",
    },
    {
      label: "削除",
      count: diffResult.removed.length,
      color: "#f87171",
      bg: "rgba(248,113,113,0.1)",
      icon: "🗑️",
    },
  ];

  const changedCount =
    diffResult.changed.length + diffResult.added.length + diffResult.removed.length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>📊 差分サマリ</h2>
          <span className={styles.totalBadge}>{totalFiles} ファイル中 {changedCount} 件変更</span>
        </div>
      </div>

      <div className={styles.cards}>
        {stats.map((s) => (
          <div
            key={s.label}
            className={styles.card}
            style={{ borderColor: s.color + "44", background: s.bg }}
          >
            <span className={styles.cardIcon}>{s.icon}</span>
            <span className={styles.cardCount} style={{ color: s.color }}>
              {s.count}
            </span>
            <span className={styles.cardLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
