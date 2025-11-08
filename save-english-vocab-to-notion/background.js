// background.js - バックグラウンドサービスワーカー

// 拡張機能がインストールされた時の処理
chrome.runtime.onInstalled.addListener(() => {
  console.log('Save Vocabulary to Notion extension installed');
  
  // コンテキストメニューを作成（右クリックメニュー）
  chrome.contextMenus.create({
    id: 'saveVocabToNotion',
    title: 'Save "%s" to Notion',
    contexts: ['selection']
  });
});

// コンテキストメニューがクリックされた時の処理
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'saveVocabToNotion' && info.selectionText) {
    // 設定を取得
    const result = await chrome.storage.local.get(['notionApiKey', 'notionDatabaseId']);
    const apiKey = result.notionApiKey;
    const databaseId = result.notionDatabaseId;

    if (!apiKey || !databaseId) {
      // 設定がない場合はポップアップを開く
      chrome.action.openPopup();
      return;
    }

    // 選択されたテキストを保存
    const selectedText = info.selectionText.trim();
    const wordCount = selectedText.split(/\s+/).length;
    const vocabData = {
      word: wordCount <= 3 ? selectedText : selectedText.substring(0, 100),
      context: wordCount > 3 ? selectedText : '',
      url: tab.url
    };

    try {
      await saveVocabToNotion(vocabData, apiKey, databaseId);
      // 成功通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon/icon48.png',
        title: 'Saved to Notion',
        message: `"${selectedText.substring(0, 50)}..." を保存しました`
      });
    } catch (error) {
      // エラー通知
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon/icon48.png',
        title: 'Error',
        message: '保存に失敗しました'
      });
    }
  }
});

// Notion APIに単語を保存する関数
async function saveVocabToNotion(vocabData, apiKey, databaseId) {
  const { word, context, url } = vocabData;
  
  // 現在の日付を取得
  const today = new Date().toISOString().split('T')[0];
  
  // URLの検証 - chrome://などの特殊URLはnullに変換
  let validUrl = null;
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    validUrl = url;
  }
  
  const requestBody = {
    parent: {
      database_id: databaseId
    },
    properties: {
      "単語": {
        title: [{ text: { content: word || (context ? context.substring(0, 100) : 'Untitled') } }]
      },
      "文脈": {
        rich_text: context ? [{ text: { content: context } }] : []
      },
      "URL": {
        url: validUrl
      },
      "日付": {
        date: { start: today }
      }
    }
  };

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Notion API error:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving to Notion:', error);
    throw error;
  }
}

// メッセージハンドラー
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveVocabToNotion') {
    saveVocabToNotion(request.vocabData, request.apiKey, request.databaseId)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 非同期応答を示す
  }
});
