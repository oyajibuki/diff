// ① 固定ディレクトリ（完全無視）
export const IGNORE_DIRS = [
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  ".cache",
  ".turbo",
  ".expo",
  ".vscode",
  ".idea",
  "coverage",
  ".DS_Store",
  "__pycache__",
  ".pytest_cache",
  "vendor",
  ".svn",
];

// ② 拡張子（バイナリ除外）
export const IGNORE_EXT = [
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico",
  ".mp4", ".mov", ".avi", ".mkv", ".webm",
  ".mp3", ".wav", ".ogg", ".flac",
  ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
  ".exe", ".dll", ".so", ".dylib",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".woff", ".woff2", ".ttf", ".eot", ".otf",
  ".map", ".lock",
  ".db", ".sqlite",
  ".class", ".pyc", ".pyo",
];

// ③ 特殊ファイル（ロックファイル等）
export const IGNORE_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "Gemfile.lock",
  "Cargo.lock",
  "poetry.lock",
  "composer.lock",
  ".DS_Store",
  "Thumbs.db",
];

// ④ ファイルサイズ上限
export const MAX_FILE_SIZE = 200 * 1024; // 200KB

/**
 * パスを判定して無視すべきかどうか返す
 */
export function shouldIgnore(path) {
  const lower = path.toLowerCase().replace(/\\/g, "/");
  const segments = lower.split("/");

  // ディレクトリ名チェック（パスのいずれかのセグメントが無視対象）
  for (const seg of segments.slice(0, -1)) {
    if (IGNORE_DIRS.includes(seg)) return true;
  }

  // ファイル名チェック
  const fileName = segments[segments.length - 1];
  if (IGNORE_FILES.includes(fileName)) return true;

  // 拡張子チェック
  if (IGNORE_EXT.some((ext) => lower.endsWith(ext))) return true;

  // minified ファイル
  if (lower.includes(".min.")) return true;

  // hidden ファイル (. で始まるファイル、ただし .env系はOK)
  if (fileName.startsWith(".") && !fileName.startsWith(".env")) return true;

  return false;
}
