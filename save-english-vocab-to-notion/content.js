// content.js - コンテンツスクリプト：選択されたテキストを取得

// 選択されたテキストを取得する関数
function getSelectedText() {
  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : '';
  
  return {
    selectedText: selectedText,
    url: window.location.href
  };
}

// 拡張機能からのメッセージを受信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    try {
      const data = getSelectedText();
      sendResponse(data);
    } catch (error) {
      console.error('コンテンツスクリプトでエラー:', error);
      sendResponse({ selectedText: '', url: window.location.href });
    }
  }
  return true;
});

// ページが読み込まれた時にコンテンツスクリプトが動作していることを確認
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Save Vocabulary to Notion content script loaded');
  });
} else {
  console.log('Save Vocabulary to Notion content script loaded');
}
