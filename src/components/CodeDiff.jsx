import { useMemo } from "react";
import { diffLines } from "diff";
import styles from "./CodeDiff.module.css";

export default function CodeDiff({ path, beforeContent, afterContent, onClose }) {
  const changes = useMemo(() => {
    if (!beforeContent || !afterContent) return null;
    return diffLines(beforeContent, afterContent);
  }, [beforeContent, afterContent]);

  if (!path) return null;

  const fileName = path.split("/").pop();

  if (!beforeContent && !afterContent) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.fileName}>{fileName}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.notice}>バイナリまたはサイズ超過のため差分表示不可</div>
      </div>
    );
  }

  // added-only
  if (!beforeContent) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.fileName}>{fileName}</span>
          <span className={styles.badge} style={{ color: "#34d399", background: "rgba(52,211,153,0.1)" }}>新規追加</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <pre className={styles.code}>
          <span className={styles.added}>{afterContent}</span>
        </pre>
      </div>
    );
  }

  // removed-only
  if (!afterContent) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.fileName}>{fileName}</span>
          <span className={styles.badge} style={{ color: "#f87171", background: "rgba(248,113,113,0.1)" }}>削除済み</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <pre className={styles.code}>
          <span className={styles.removed}>{beforeContent}</span>
        </pre>
      </div>
    );
  }

  const addedLines = changes.filter((c) => c.added).reduce((s, c) => s + c.count, 0);
  const removedLines = changes.filter((c) => c.removed).reduce((s, c) => s + c.count, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.fileName}>{fileName}</span>
        <div className={styles.stats}>
          <span className={styles.added}>+{addedLines}</span>
          <span className={styles.removedStat}>-{removedLines}</span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.codeWrap}>
        <pre className={styles.code}>
          {changes.map((part, i) => {
            const lines = part.value.split("\n");
            return lines.map((line, li) => {
              if (li === lines.length - 1 && line === "") return null;
              return (
                <div
                  key={`${i}-${li}`}
                  className={`${styles.line} ${
                    part.added
                      ? styles.lineAdded
                      : part.removed
                      ? styles.lineRemoved
                      : styles.lineNormal
                  }`}
                >
                  <span className={styles.lineSign}>
                    {part.added ? "+" : part.removed ? "−" : " "}
                  </span>
                  <span className={styles.lineContent}>{line}</span>
                </div>
              );
            });
          })}
        </pre>
      </div>
    </div>
  );
}
