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
    const vocabData = {
      word: selectedText,
      meaning: ''
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
  const { word, meaning } = vocabData;
  
  const requestBody = {
    parent: {
      database_id: databaseId
    },
    properties: {
      "単語": {
        title: [{ text: { content: word || 'Untitled' } }]
      },
      "意味": {
        rich_text: meaning ? [{ text: { content: meaning } }] : []
      }
    }
  };

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2025-09-03'
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
