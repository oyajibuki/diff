# ⚡ VibeDiff (バイブ・ディフ)

**AIエンジニア（バイブコーダー）のための、ロジック翻訳・差分解説ツール**

AI（Cursor, Cline, ChatGPT等）を使った開発で、「AIがどこをどう変えたか分からない」「動きの理由を言葉で理解したい」という不安を解消するために生まれた、ローカル完結型の差分解析ツールです。

## 🌟 主な特徴

- **フォルダごと一括比較**: 1ファイルずつではなく、プロジェクト全体の変更箇所を一撃でリストアップします。
- **インテリジェント翻訳**: コードの変更を「心臓部」「司令塔」「背骨」といったメタファーを使い、非エンジニアでも分かる言葉で解説します。
- **プロジェクト自動判別**: iOS (Swift), Python, Web (React/Next.js), 自動化ツールなど、ファイル構成からプロジェクトの種類を自動で特定し、最適な解説を行います。
- **圧倒的なプライバシー**: File System Access APIを活用し、**すべての処理をブラウザ内（PCローカル）で完結**させています。コードが外部サーバーに送信されることは一切ありません。

## 🛠 技術スタック (Technical Stack)

このプロジェクトは、最新のWeb技術を駆使して「サーバーレス・ローカル完結」を実現しています。

- **Frontend**: [React 18](https://react.dev/)
- **Runtime Compiler**: [Babel (standalone)](https://babeljs.io/docs/en/babel-standalone) - ブラウザ上でReact/JSXを即時コンパイル
- **Diff Engine**: [jsdiff](https://github.com/kpdecker/jsdiff) - 高速な行単位の差分計算
- **File Access**: [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) - ブラウザからローカルフォルダを安全に操作
- **Styling**: Vanilla CSS (Modern Flexbox/Grid)
- **Architecture**: Single HTML Architecture - 環境構築不要で、HTMLファイル一つで動作可能

## 🚀 使い方

1. [VibeDiff公開ページ](https://oyajibuki.github.io/diff/) にアクセスします。
2. **ステップ①**: 修正前のフォルダを選択し、構造を分析します。
3. **ステップ②**: 修正後のフォルダ（AIによる変更後など）を選択します。
4. 左側のリストから変更されたファイルを選択すると、そのファイルの「役割」と「具体的なロジックの変化」が日本語で表示されます。

## 🔒 セキュリティについて

VibeDiffは、ユーザーのプライバシーを最優先に設計されています。
- 通信が発生するのは、アクセスカウンターの送信のみです。
- **ソースコード、ファイル名、ディレクトリ構造などは、一切外部に送信されません。**
- すべての解析ロジックはあなたのブラウザ上で動作しています。

## 📄 ライセンス・お問い合わせ

- **Copyright**: &copy; 2026 Asagiri
- **不具合・要望**: [お問い合わせフォーム](https://oyajibuki.github.io/form/?subject=%E3%80%90VibeDiff%E3%80%91%E4%B8%8D%E5%85%B7%E5%90%88%E3%83%BB%E8%A6%81%E6%9C%9B%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6) までお願いします。
