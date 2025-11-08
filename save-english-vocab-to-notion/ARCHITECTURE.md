# アーキテクチャ / Architecture

## システム概要 / System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               │ Click Icon              │ Right-click
               ↓                          ↓
┌──────────────────────────┐   ┌─────────────────────────────┐
│      popup.html          │   │    Context Menu             │
│      popup.css           │   │    (background.js)          │
│      popup.js            │   └───────────┬─────────────────┘
└──────────────┬───────────┘               │
               │                           │
               │ Get Selected Text         │
               ↓                           │
┌──────────────────────────┐               │
│     content.js           │               │
│  (Text Selection)        │               │
└──────────────┬───────────┘               │
               │                           │
               │ Send Message              │ Send Message
               ↓                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  background.js                               │
│               (Service Worker)                               │
│                                                               │
│  - Context Menu Registration                                 │
│  - Notion API Integration                                    │
│  - Error Handling                                            │
│  - Notifications                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP POST
                         ↓
┌─────────────────────────────────────────────────────────────┐
│               Notion API (v2022-06-28)                       │
│               https://api.notion.com/v1/pages                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  Notion Database                             │
│                                                               │
│  Properties:                                                 │
│  - 単語 (Title)                                              │
│  - 文脈 (Rich Text)                                          │
│  - URL (URL)                                                 │
│  - 日付 (Date)                                               │
└─────────────────────────────────────────────────────────────┘
```

## コンポーネント詳細 / Component Details

### 1. manifest.json
**役割**: 拡張機能の設定と権限管理

```json
{
  "manifest_version": 3,
  "permissions": [
    "activeTab",      // 現在のタブへのアクセス
    "storage",        // ローカルストレージ
    "contextMenus",   // 右クリックメニュー
    "notifications"   // 通知
  ],
  "host_permissions": [
    "https://api.notion.com/*"  // Notion APIへのアクセス
  ]
}
```

### 2. popup.html / popup.css / popup.js
**役割**: ユーザーインターフェース

#### フロー:
```
User Action
    ↓
Open Popup (popup.html)
    ↓
Load Settings from Chrome Storage
    ↓
Get Selected Text from content.js
    ↓
Display in UI with Auto-fill
    ↓
User Confirms/Edits
    ↓
Send to background.js
    ↓
Display Status/Result
```

#### 主要機能:
- タブ切り替え（単語保存/設定）
- 設定の保存/読み込み
- テキスト自動入力
- バリデーション
- エラー表示

### 3. content.js
**役割**: ページ内のテキスト選択を検出

```javascript
getSelectedText() → {
  selectedText: string,
  url: string
}
```

#### 実行タイミング:
- ページ読み込み時に自動注入
- popup.jsからのメッセージ受信時

### 4. background.js
**役割**: バックグラウンド処理とAPI通信

#### 主要機能:

##### 4-1. コンテキストメニュー
```javascript
chrome.contextMenus.create({
  id: 'saveVocabToNotion',
  title: 'Save "%s" to Notion',
  contexts: ['selection']
})
```

##### 4-2. Notion API統合
```javascript
saveVocabToNotion(vocabData, apiKey, databaseId)
  ↓
Validate URL (http/https only)
  ↓
Build Request Body
  ↓
POST to Notion API
  ↓
Return Result
```

##### 4-3. エラーハンドリング
- APIキー未設定時の処理
- ネットワークエラー処理
- URL検証
- 空データ処理

## データフロー / Data Flow

### シナリオ1: ポップアップから保存

```
1. User selects "ephemeral" on webpage
       ↓
2. User clicks extension icon
       ↓
3. popup.js requests selected text from content.js
       ↓
4. content.js returns { selectedText: "ephemeral", url: "..." }
       ↓
5. popup.js displays in UI
       ↓
6. User adds context: "The ephemeral nature of..."
       ↓
7. User clicks "Save to Notion"
       ↓
8. popup.js sends message to background.js:
   {
     action: 'saveVocabToNotion',
     vocabData: { word, context, url },
     apiKey: "...",
     databaseId: "..."
   }
       ↓
9. background.js validates and sends to Notion API
       ↓
10. background.js returns success/error
       ↓
11. popup.js displays status message
```

### シナリオ2: 右クリックメニューから保存

```
1. User selects "serendipity" on webpage
       ↓
2. User right-clicks
       ↓
3. User selects "Save 'serendipity' to Notion"
       ↓
4. background.js receives click event
       ↓
5. background.js gets API key and Database ID from storage
       ↓
6. background.js processes selected text:
   - If ≤3 words → word
   - If >3 words → context
       ↓
7. background.js sends to Notion API
       ↓
8. background.js shows notification
```

## ストレージ構造 / Storage Structure

### Chrome Storage (Local)

```javascript
{
  "notionApiKey": "secret_xxx...xxx",
  "notionDatabaseId": "abc123def456..."
}
```

### セキュリティ:
- Chrome Storage API（暗号化）
- ローカルストレージのみ
- 外部への送信なし（Notion API除く）

## Notion API リクエスト構造 / Notion API Request Structure

```javascript
POST https://api.notion.com/v1/pages

Headers:
  Authorization: Bearer {apiKey}
  Content-Type: application/json
  Notion-Version: 2022-06-28

Body:
{
  "parent": {
    "database_id": "{databaseId}"
  },
  "properties": {
    "単語": {
      "title": [{ "text": { "content": "{word}" } }]
    },
    "文脈": {
      "rich_text": [{ "text": { "content": "{context}" } }]
    },
    "URL": {
      "url": "{url}"
    },
    "日付": {
      "date": { "start": "2025-11-08" }
    }
  }
}
```

## エラーハンドリング / Error Handling

```
┌─────────────────────┐
│   Error Occurs      │
└──────┬──────────────┘
       │
       ├─→ API Key Missing → Show settings tab
       │
       ├─→ Network Error → Show error message
       │
       ├─→ Invalid URL → Convert to null
       │
       ├─→ Empty Word/Context → Use fallback
       │
       └─→ Notion API Error → Show error with details
```

## パフォーマンス最適化 / Performance Optimization

1. **非同期処理**
   - すべてのAPI呼び出しは非同期
   - UIをブロックしない

2. **軽量化**
   - 最小限のコード
   - 外部ライブラリ不使用
   - 合計サイズ: ~80KB

3. **効率的なメッセージング**
   - 必要な時のみcontent scriptと通信
   - バックグラウンドで処理

## セキュリティ対策 / Security Measures

1. **認証情報の保護**
   ```
   Chrome Storage API
     ↓ (Encrypted)
   Local Storage
     ↓ (HTTPS Only)
   Notion API
   ```

2. **URL検証**
   ```javascript
   if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
     validUrl = url;
   } else {
     validUrl = null;  // chrome:// などを除外
   }
   ```

3. **XSS対策**
   - textContentを使用（innerHTML不使用）
   - ユーザー入力のサニタイズ

4. **CORS対策**
   - host_permissionsで明示的に許可
   - Notion API URLのみ

## 拡張性 / Extensibility

### 将来追加可能な機能:

1. **辞書API連携**
   ```
   background.js
       ↓
   Dictionary API
       ↓
   Get Definition
       ↓
   Add to Notion
   ```

2. **複数データベース対応**
   ```
   Settings
       ↓
   Multiple Database IDs
       ↓
   User Selects Database
       ↓
   Save to Selected Database
   ```

3. **オフライン対応**
   ```
   No Internet
       ↓
   Save to IndexedDB
       ↓
   Sync when Online
   ```

## テスト戦略 / Testing Strategy

### 手動テスト:
1. ポップアップからの保存
2. 右クリックメニューからの保存
3. 設定の保存/読み込み
4. エラーケース
5. 異なるURL（http, https, chrome://）
6. 長いテキスト/短いテキスト

### 検証済み:
- ✅ JavaScript構文
- ✅ JSON構文
- ✅ HTML構造
- ✅ CodeQL（セキュリティ）
- ✅ エッジケース

## 依存関係 / Dependencies

```
Chrome APIs:
  - chrome.storage
  - chrome.tabs
  - chrome.runtime
  - chrome.scripting
  - chrome.contextMenus
  - chrome.notifications

External APIs:
  - Notion API v2022-06-28

No External Libraries
```

## ファイルサイズ / File Sizes

```
Total: ~80KB

Code:
- background.js:  3.8KB
- popup.js:       6.9KB
- content.js:     1.2KB
- popup.css:      6.4KB
- popup.html:     2.5KB
- manifest.json:  750B

Documentation:
- README.md:       3.4KB
- INSTALL.md:      6.4KB
- FEATURES.md:     4.2KB
- USAGE_GUIDE.md:  7.8KB
- SUMMARY.md:      6.2KB
- ARCHITECTURE.md: (this file)

Assets:
- Icons:          2.2KB (total)

Test:
- test-page.html:  4.6KB
```

## まとめ / Summary

このアーキテクチャは以下の特徴を持っています：

- ✅ **シンプル**: 最小限のコンポーネント
- ✅ **セキュア**: 暗号化されたストレージ、URL検証
- ✅ **効率的**: 非同期処理、軽量
- ✅ **拡張可能**: 将来の機能追加が容易
- ✅ **メンテナブル**: 明確な責任分離
