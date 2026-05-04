import { shouldIgnore, MAX_FILE_SIZE } from "./ignore";
import { hash } from "./hash";
import { detectRole } from "./role";

/**
 * ディレクトリを再帰的にスキャンしてファイルマップを生成する
 * @param {FileSystemDirectoryHandle} dirHandle
 * @param {string} base ベースパス
 * @returns {Promise<Record<string, FileEntry>>}
 */
export async function scanDirectory(dirHandle, base = "") {
  const map = {};

  for await (const [name, handle] of dirHandle.entries()) {
    const path = `${base}/${name}`;

    if (handle.kind === "directory") {
      // 無視ディレクトリはスキップ
      if (shouldIgnore(path + "/")) continue;
      Object.assign(map, await scanDirectory(handle, path));
    } else {
      // 無視ファイルはスキップ
      if (shouldIgnore(path)) continue;

      const file = await handle.getFile();

      // サイズ超過はスキップ
      if (file.size > MAX_FILE_SIZE) {
        map[path] = {
          size: file.size,
          hash: file.size, // サイズだけでハッシュ代用
          content: null,
          handle,
          role: detectRole(path, ""),
          tooLarge: true,
        };
        continue;
      }

      let content = null;
      let fileHash = file.size;

      content = await file.text();
      fileHash = hash(content);

      map[path] = {
        size: file.size,
        hash: fileHash,
        content,
        handle,
        role: detectRole(path, content),
        tooLarge: false,
      };
    }
  }

  return map;
}
