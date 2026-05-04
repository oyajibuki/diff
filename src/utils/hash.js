/**
 * 軽量な文字列ハッシュ関数（djb2変種）
 */
export function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h |= 0; // 32bit int に丸める
  }
  return h >>> 0; // 符号なし
}
