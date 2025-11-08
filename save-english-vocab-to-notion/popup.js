// popup.js - ポップアップのメイン機能

document.addEventListener('DOMContentLoaded', async () => {
  // DOM要素の取得
  const apiKeyInput = document.getElementById('api-key');
  const databaseIdInput = document.getElementById('database-id');
  const saveSettingsBtn = document.getElementById('save-settings');
  const wordInput = document.getElementById('word');
  const meaningInput = document.getElementById('meaning');
  const saveWordBtn = document.getElementById('save-word');
  const statusDiv = document.getElementById('status');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // タブ切り替え機能
  function switchTab(targetTabId) {
    // すべてのタブボタンとコンテンツから active クラスを削除
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 選択されたタブボタンにactiveクラスを追加
    const activeButton = document.querySelector(`[data-tab="${targetTabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
    
    // 選択されたタブコンテンツにactiveクラスを追加
    const activeContent = document.getElementById(targetTabId);
    if (activeContent) {
      activeContent.classList.add('active');
    }
  }

  // タブボタンのクリックイベント
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // 設定ボタンの状態を更新
  function updateSettingsButtonState() {
    const apiKey = apiKeyInput.value.trim();
    const databaseId = databaseIdInput.value.trim();
    const hasValidInputs = apiKey && databaseId;
    
    saveSettingsBtn.disabled = !hasValidInputs;
  }

  // ストレージから設定を読み込み
  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get(['notionApiKey', 'notionDatabaseId']);
      if (result.notionApiKey) {
        apiKeyInput.value = result.notionApiKey;
      }
      if (result.notionDatabaseId) {
        databaseIdInput.value = result.notionDatabaseId;
      }
      updateSettingsButtonState();
    } catch (error) {
      showStatus('設定の読み込みに失敗しました', 'error');
    }
  }

  // 選択されたテキストを取得
  async function loadSelectedText() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 特別なページの場合は選択テキストを取得しない
      if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://') || tab.url.startsWith('moz-extension://')) {
        return;
      }
      
      // まずコンテンツスクリプトから選択テキストを取得を試行
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' });
        if (response && response.selectedText) {
          const selectedText = response.selectedText.trim();
          if (selectedText) {
            // 選択されたテキストを単語フィールドに入力
            wordInput.value = selectedText;
            return;
          }
        }
      } catch (messageError) {
        console.log('コンテンツスクリプトからの取得に失敗、executeScriptで再試行:', messageError);
      }
      
      // フォールバック: chrome.scripting.executeScript を使用
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            const selection = window.getSelection();
            return selection ? selection.toString().trim() : '';
          }
        });
        
        if (results && results[0] && results[0].result) {
          const selectedText = results[0].result.trim();
          if (selectedText) {
            wordInput.value = selectedText;
          }
        }
      } catch (scriptError) {
        console.log('スクリプト実行からの取得に失敗:', scriptError);
      }
      
    } catch (error) {
      console.error('テキスト取得エラー:', error);
    }
  }

  // ステータスメッセージを表示
  function showStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  // 設定入力フィールドの変更イベント
  apiKeyInput.addEventListener('input', updateSettingsButtonState);
  databaseIdInput.addEventListener('input', updateSettingsButtonState);

  // 設定の保存
  saveSettingsBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const databaseId = databaseIdInput.value.trim();

    if (!apiKey || !databaseId) {
      showStatus('API KeyとDatabase IDの両方を入力してください', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({
        notionApiKey: apiKey,
        notionDatabaseId: databaseId
      });
      showStatus('設定を保存しました', 'success');
    } catch (error) {
      showStatus('設定の保存に失敗しました', 'error');
    }
  });

  // 単語の保存
  saveWordBtn.addEventListener('click', async () => {
    // 設定を確認
    const result = await chrome.storage.local.get(['notionApiKey', 'notionDatabaseId']);
    const apiKey = result.notionApiKey;
    const databaseId = result.notionDatabaseId;

    if (!apiKey || !databaseId) {
      showStatus('まず設定でAPI KeyとDatabase IDを入力してください', 'error');
      switchTab('settings-section');
      return;
    }

    // 入力値を取得
    const word = wordInput.value.trim();
    const meaning = meaningInput.value.trim();

    if (!word) {
      showStatus('単語を入力してください', 'error');
      wordInput.focus();
      return;
    }

    // 保存処理
    saveWordBtn.disabled = true;
    saveWordBtn.textContent = '保存中...';
    showStatus('Notionに保存しています...', 'info');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveVocabToNotion',
        vocabData: { word, meaning },
        apiKey,
        databaseId
      });

      if (response.success) {
        showStatus('Notionに保存しました！', 'success');
        // 入力フィールドをクリア
        wordInput.value = '';
        meaningInput.value = '';
      } else {
        showStatus(`保存に失敗しました: ${response.error}`, 'error');
      }
    } catch (error) {
      showStatus('保存中にエラーが発生しました', 'error');
    } finally {
      saveWordBtn.disabled = false;
      saveWordBtn.textContent = 'Notionに保存';
    }
  });

  // Enterキーで保存
  wordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !saveWordBtn.disabled) {
      saveWordBtn.click();
    }
  });

  // 初期化
  await loadSettings();
  await loadSelectedText();
});
