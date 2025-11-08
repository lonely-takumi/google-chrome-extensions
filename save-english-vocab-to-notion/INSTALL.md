# インストールと使用ガイド / Installation and Usage Guide

## 日本語

### インストール手順

#### 1. 拡張機能をChromeにロードする

1. Chromeで `chrome://extensions/` を開く
2. 右上の「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. このディレクトリ（`save-english-vocab-to-notion`）を選択

#### 2. Notionの準備

##### 2-1. データベースの作成

1. Notionで新しいページを作成
2. データベース（テーブル）を追加
3. 以下のプロパティを作成：

| プロパティ名 | タイプ | 必須 |
|------------|--------|------|
| 単語 | タイトル | ✓ |
| 意味 | リッチテキスト | - |

**重要**: プロパティ名は正確に一致する必要があります。

##### 2-2. Notion APIキーの取得

1. [Notion Integrations](https://www.notion.so/my-integrations) にアクセス
2. 「+ New integration」をクリック
3. 以下を設定：
   - Name: 任意の名前（例：Vocabulary Saver）
   - Associated workspace: 使用するワークスペース
   - Capabilities: 読み取りと書き込みの両方を有効に
4. 「Submit」をクリック
5. 表示された「Internal Integration Token」をコピー（後で使用）

##### 2-3. データベースIDの取得

1. 作成したデータベースページをブラウザで開く
2. URLをコピー
3. URLの形式：
   ```
   https://www.notion.so/{workspace}/{database_id}?v={view_id}
   ```
4. `database_id` の部分（32文字の英数字とハイフン）がデータベースID

**例**: 
```
URL: https://www.notion.so/myworkspace/abc123def456?v=xyz789
Database ID: abc123def456
```

##### 2-4. インテグレーションをデータベースに接続

1. Notionのデータベースページを開く
2. 右上の「...」メニューをクリック
3. 「Add connections」を選択
4. 作成したインテグレーション（例：Vocabulary Saver）を選択

#### 3. 拡張機能の設定

1. Chrome拡張機能のアイコンをクリック
2. 「設定」タブを開く
3. 以下を入力：
   - **Notion API Key**: 手順2-2で取得したトークン
   - **Database ID**: 手順2-3で取得したID
4. 「設定を保存」をクリック

### 使い方

#### 方法1: ポップアップから保存

1. 保存したい単語をテキスト選択する（オプション）
2. 拡張機能のアイコンをクリック
3. 単語が自動入力される（選択していた場合）
4. 意味を入力
5. 「Notionに保存」をクリック

#### 方法2: 右クリックメニューから保存（推奨）

1. 保存したい単語を選択
2. 右クリック
3. 「Save "{選択したテキスト}" to Notion」を選択
4. 通知で保存完了を確認
5. Notionで意味を追加

#### テストページの使用

`test-page.html` をブラウザで開いて、様々な英単語で拡張機能をテストできます。

---

## English

### Installation Steps

#### 1. Load the Extension in Chrome

1. Open `chrome://extensions/` in Chrome
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select this directory (`save-english-vocab-to-notion`)

#### 2. Notion Setup

##### 2-1. Create a Database

1. Create a new page in Notion
2. Add a database (table)
3. Create the following properties:

| Property Name | Type | Required |
|--------------|------|----------|
| 単語 (Word) | Title | ✓ |
| 意味 (Meaning) | Rich Text | - |

**Important**: Property names must match exactly (use Japanese names).

##### 2-2. Get Notion API Key

1. Visit [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "+ New integration"
3. Configure:
   - Name: Any name (e.g., "Vocabulary Saver")
   - Associated workspace: Your workspace
   - Capabilities: Enable both read and write
4. Click "Submit"
5. Copy the "Internal Integration Token" (you'll need this later)

##### 2-3. Get Database ID

1. Open your database page in a browser
2. Copy the URL
3. URL format:
   ```
   https://www.notion.so/{workspace}/{database_id}?v={view_id}
   ```
4. The `database_id` part (32 alphanumeric characters and hyphens) is your Database ID

**Example**: 
```
URL: https://www.notion.so/myworkspace/abc123def456?v=xyz789
Database ID: abc123def456
```

##### 2-4. Connect Integration to Database

1. Open your database page in Notion
2. Click the "..." menu in the top right
3. Select "Add connections"
4. Choose your integration (e.g., "Vocabulary Saver")

#### 3. Configure the Extension

1. Click the extension icon in Chrome
2. Open the "設定" (Settings) tab
3. Enter:
   - **Notion API Key**: Token from step 2-2
   - **Database ID**: ID from step 2-3
4. Click "設定を保存" (Save Settings)

### Usage

#### Method 1: Save via Popup

1. Select a word you want to save (optional)
2. Click the extension icon
3. The word will be auto-filled (if you selected text)
4. Add the meaning
5. Click "Notionに保存" (Save to Notion)

#### Method 2: Save via Right-Click Menu (Recommended)

1. Select a word you want to save
2. Right-click
3. Select "Save '{selected text}' to Notion"
4. Check the notification for confirmation
5. Add the meaning in Notion

#### Using the Test Page

Open `test-page.html` in your browser to test the extension with various English words.

### Troubleshooting

**Problem**: Words are not being saved

**Solutions**:
1. Verify API Key and Database ID are correct
2. Check that the integration has access to the database
3. Ensure property names in Notion match exactly: 単語, 意味
4. Check browser console for error messages

**Problem**: Right-click menu doesn't appear

**Solutions**:
1. Reload the webpage after installing the extension
2. Check that the extension is enabled in `chrome://extensions/`

---

## サポート / Support

問題が発生した場合は、以下を確認してください：
- Notion APIキーが正しいか
- データベースIDが正しいか
- インテグレーションがデータベースに接続されているか
- プロパティ名が正確に一致しているか

If you encounter issues, please verify:
- Notion API Key is correct
- Database ID is correct
- Integration is connected to the database
- Property names match exactly
