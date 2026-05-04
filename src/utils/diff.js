/**
 * before/after のファイルマップを比較して差分を返す
 * @param {Record<string,FileEntry>} before
 * @param {Record<string,FileEntry>} after
 * @returns {{ added: string[], removed: string[], changed: string[] }}
 */
export function detectDiff(before, after) {
  const result = {
    added: [],
    removed: [],
    changed: [],
  };

  // before にあるファイルを全チェック
  for (const key in before) {
    if (!after[key]) {
      result.removed.push(key);
    } else if (before[key].hash !== after[key].hash) {
      result.changed.push(key);
    }
  }

  // after にのみ存在するファイルを追加
  for (const key in after) {
    if (!before[key]) {
      result.added.push(key);
    }
  }

  // 重要度スコアで降順ソート
  const sortByScore = (arr, map) =>
    [...arr].sort((a, b) => {
      const sa = (map[a]?.role?.score ?? 1);
      const sb = (map[b]?.role?.score ?? 1);
      return sb - sa;
    });

  result.changed = sortByScore(result.changed, after);
  result.added = sortByScore(result.added, after);
  result.removed = sortByScore(result.removed, before);

  return result;
}
