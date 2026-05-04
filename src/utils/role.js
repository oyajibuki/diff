/**
 * ファイルパスとコンテンツからファイルの役割を推定する
 * @param {string} path
 * @param {string} content
 * @returns {{ role: string, score: number }}
 */
export function detectRole(path, content = "") {
  const name = path.toLowerCase();

  // 認証系
  if (name.includes("login") || name.includes("auth") || name.includes("signin") || name.includes("logout"))
    return { role: "認証", score: 10, icon: "🔐" };

  // 決済系
  if (name.includes("payment") || name.includes("stripe") || name.includes("checkout") || name.includes("billing"))
    return { role: "決済", score: 9, icon: "💳" };

  // セキュリティ
  if (name.includes("security") || name.includes("permission") || name.includes("role"))
    return { role: "セキュリティ", score: 8, icon: "🛡️" };

  // DB・モデル
  if (name.includes("model") || name.includes("schema") || name.includes("migration") || name.includes("prisma"))
    return { role: "データベース", score: 7, icon: "🗄️" };

  // API・通信
  if (name.includes("api") || name.includes("route") || name.includes("endpoint") || name.includes("fetch"))
    return { role: "通信・API", score: 6, icon: "🌐" };

  // 設定
  if (
    name.includes("config") ||
    name.endsWith(".env") ||
    name.endsWith(".json") ||
    name.includes("setting")
  )
    return { role: "設定", score: 5, icon: "⚙️" };

  // フック
  if (name.includes("hook") || name.startsWith("use"))
    return { role: "フック", score: 4, icon: "🪝" };

  // テスト
  if (name.includes("test") || name.includes("spec") || name.includes(".test.") || name.includes(".spec."))
    return { role: "テスト", score: 3, icon: "🧪" };

  // UIコンポーネント（コンテンツ解析）
  if (content.includes("useState") || content.includes("useEffect") || content.includes("JSX") || name.endsWith(".jsx") || name.endsWith(".tsx"))
    return { role: "UI", score: 2, icon: "🖼️" };

  // スタイル
  if (name.endsWith(".css") || name.endsWith(".scss") || name.endsWith(".sass"))
    return { role: "スタイル", score: 2, icon: "🎨" };

  return { role: "その他", score: 1, icon: "📄" };
}
