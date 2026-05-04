import RestoreButton from "./RestoreButton";
import styles from "./FileList.module.css";

const TYPE_CONFIG = {
  changed: { label: "変更", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", dot: "🟡" },
  added: { label: "追加", color: "#34d399", bg: "rgba(52,211,153,0.08)", dot: "🟢" },
  removed: { label: "削除", color: "#f87171", bg: "rgba(248,113,113,0.08)", dot: "🔴" },
};

function FileRow({ path, type, fileData, onSelect, selected, canRestore }) {
  const cfg = TYPE_CONFIG[type];
  const role = fileData?.role ?? { role: "不明", score: 1, icon: "📄" };
  const isSelected = selected === path;

  const shortPath = path.startsWith("/") ? path.slice(1) : path;
  const parts = shortPath.split("/");
  const fileName = parts.pop();
  const dir = parts.join("/");

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
      style={{ borderLeftColor: isSelected ? cfg.color : "transparent" }}
      onClick={() => onSelect && onSelect(path)}
    >
      <span className={styles.dot}>{cfg.dot}</span>

      <div className={styles.pathInfo}>
        {dir && <span className={styles.dir}>{dir}/</span>}
        <span className={styles.fileName}>{fileName}</span>
      </div>

      <div className={styles.meta}>
        <span className={styles.roleBadge} title={`重要度: ${role.score}/10`}>
          {role.icon} {role.role}
        </span>
        <span className={styles.typeBadge} style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </span>
        {fileData?.size && (
          <span className={styles.size}>
            {fileData.size > 1024
              ? `${(fileData.size / 1024).toFixed(1)}KB`
              : `${fileData.size}B`}
          </span>
        )}
      </div>

      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        {type !== "removed" && onSelect && (
          <button
            className={`${styles.diffBtn} ${isSelected ? styles.diffBtnActive : ""}`}
            onClick={() => onSelect(path)}
          >
            {isSelected ? "▼ 差分表示中" : "差分を見る"}
          </button>
        )}
        {canRestore && type === "changed" && fileData?.handle && (
          <RestoreButton path={path} fileHandle={fileData.handle} />
        )}
      </div>
    </div>
  );
}

export default function FileList({ diffResult, beforeMap, afterMap, onSelect, selected, canRestore }) {
  const allFiles = [
    ...diffResult.changed.map((p) => ({ path: p, type: "changed", data: afterMap[p] })),
    ...diffResult.added.map((p) => ({ path: p, type: "added", data: afterMap[p] })),
    ...diffResult.removed.map((p) => ({ path: p, type: "removed", data: beforeMap[p] })),
  ];

  if (allFiles.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎉</div>
        <p>差分なし — ファイルに変更はありません</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📁 変更ファイル一覧</h2>
      <div className={styles.list}>
        {allFiles.map(({ path, type, data }) => (
          <FileRow
            key={path}
            path={path}
            type={type}
            fileData={data}
            onSelect={type !== "removed" ? onSelect : null}
            selected={selected}
            canRestore={canRestore}
          />
        ))}
      </div>
    </div>
  );
}
