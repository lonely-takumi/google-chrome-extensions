# google-chrome-extensions

Google Chrome拡張機能のコレクション / Collection of Chrome Extensions for Notion Integration

このリポジトリには、Notionと連携してWebブラウジングをより生産的にするChrome拡張機能が含まれています。

## 拡張機能一覧 / Extensions

### 1. Save to Scrapbook on Notion
WebページをNotionのスクラップブックに保存するChrome拡張機能

**機能:**
- Webページの保存
- タイトル、URL、ソース、タグの管理
- Notion APIとの連携

📁 [詳細はこちら](./save-to-scrapbook-on-notion/)

---

### 2. Save English Vocabulary to Notion ✨ **NEW**
英語のwebページを読んでいるときや勉強しているときに出てきた知らない英単語をNotionに保存するChrome拡張機能

Save English vocabulary words to Notion while reading or studying English web pages.

**主な機能 / Key Features:**
- 🔤 英単語の保存 / Save English words
- 📝 文脈の記録 / Preserve context
- 🔗 URL自動記録 / Auto-record source URLs
- 📅 日付自動記録 / Auto-record dates
- 🖱️ 右クリックメニュー対応 / Right-click menu support
- 🎨 ライト/ダークモード / Light/dark mode
- 🔒 セキュアな認証情報管理 / Secure credential storage

**技術仕様 / Technical Specs:**
- Chrome Manifest V3
- Notion API v2022-06-28
- サイズ / Size: ~108KB
- セキュリティ / Security: ✅ CodeQL verified (0 vulnerabilities)

📁 [詳細はこちら / Learn more](./save-english-vocab-to-notion/)

**ドキュメント / Documentation:**
- [README.md](./save-english-vocab-to-notion/README.md) - 基本的な使い方 / Basic usage
- [INSTALL.md](./save-english-vocab-to-notion/INSTALL.md) - インストール手順 / Installation guide
- [USAGE_GUIDE.md](./save-english-vocab-to-notion/USAGE_GUIDE.md) - 詳細な使い方 / Detailed usage
- [FEATURES.md](./save-english-vocab-to-notion/FEATURES.md) - 機能詳細 / Feature details
- [ARCHITECTURE.md](./save-english-vocab-to-notion/ARCHITECTURE.md) - 技術仕様 / Technical architecture

---

## 共通の特徴 / Common Features

すべての拡張機能は以下の特徴を共有しています：

- ✅ Notion API統合
- ✅ セキュアな認証情報管理（Chrome Storage API）
- ✅ シンプルで使いやすいUI
- ✅ ライト/ダークモード対応
- ✅ エラーハンドリング
- ✅ 包括的なドキュメント

## インストール方法 / Installation

各拡張機能のディレクトリにある INSTALL.md または README.md を参照してください。

基本的な手順：
1. `chrome://extensions/` を開く
2. デベロッパーモードを有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. 該当する拡張機能のディレクトリを選択

## 開発 / Development

### 必要な環境
- Google Chrome（最新版推奨）
- Notionアカウント
- Notion API Key

### 共通の設定
各拡張機能で以下の設定が必要です：
1. Notion APIキーの取得
2. Notionデータベースの作成
3. インテグレーションの接続

## ライセンス / License

MIT License

## 貢献 / Contributing

Issues and Pull Requests are welcome!

## 作者 / Author

lonely-takumi