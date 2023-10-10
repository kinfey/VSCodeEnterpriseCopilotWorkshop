# **Visual Studio Code 外掛開發**


Visual Studio Code 是一個非常流行的開源開發工具。 透過安裝不同的擴充，可以完成不同程式語言的支援、DevOps等相關工作。 作為開發人員，您每天都離不開 Visual Studio Code。 在這裡，我們將瞭解Visual Studio Code Extension是如何開發的。

## **環境配置**

1. 安裝 NodeJS 18+

2. 開啟命令列並執行以下命令安裝 Visual Studio Code 外掛支援

```bash
npm install -g yo generator-code
```

3. 從命令列建立 Visual Studio Code 外掛專案

```bash
yo code
```

命令列中將顯示以下選項

![image](/imgs/01/01.png)

Visual Studio Code Extensions 支援 TypeScript 和 JavaScript 開發，本次 Workshop 使用 JavaScript。

請按照此圖片完成設定

![image](/imgs/01/02.png)

建立完成後，選擇Visual Studio Code開啟專案

![image](/imgs/01/03.png)

選擇執行，按Ctrl+Shift+P，輸入Hello World，如下圖，專案建立完成。

![image](/imgs/01/04.png)


## **VSCode 外掛相關檔案**

### **package.json**

除了與 Visual Studio Code Extension 相關的 node 包外，您還可以透過 package.json 管理與 Visual Studio Code Extension 相關的節點套件。 您還可以在此處設定專案檔案、響應事件繫結、佈局和相關設定，例如 Azure OpenAI 的 Endpoint 和 Key。

### **extensions.js**

這是 Visual Studio Code 外掛的實際邏輯實現。 這是核心檔案，預設放置在根目錄下，但是我們可以將該檔案放置在其他資料夾中，例如設定一個./src檔案。

![image](/imgs/01/05.png)

修改 package.json，在 main 中設定新位置


```json
  "activationEvents": [],
  "main": "./src/extension.js",
  "contributes": {
    "commands": [{
      "command": "copilotext.helloWorld",
      "title": "Hello World"
    }]
  }
```


## **複製一個 GitHub Copilot Chat 介面**

![image](/imgs/01/06.png)

您使用過 GitHub Copilot Chat 嗎？ 你可以一邊聊天一邊結合自己的業務，完成編寫程式的工作。 企業級的副駕駛或者您可能需要類似的介面。 接下來我們開始在 Visual Studio Code Extension 中建構類似的介面。

我們知道 Visual Studio Code 是建立在 Electron 框架之上的。 所以本質上該介面是一個WebView。 我們需要進行Visual Studio Code程式設計，更多的是基於Web UI的實現。

### **1. 在 extensions.js 新增 WebView **

*新增 initChatViewContent 方法*

我們希望模仿 GitHub Copilot Chat 的實現，在左側選單上建構一個聊天介面。 我們需要初始化控制啟用函式。 我們透過Webview來實現。 我們透過WebViewProvider以及WebView對應的顯示事件來設定顯示內容。


```javascript

    let webView;

	let extensionURL = context.extensionUri;


	let webViewProvider={
			resolveWebviewView: (_webviewView , _webviewContex) => {
				_webviewView.webview.options={enableScripts:true};
				this.webView = _webviewView;
				this.webView.webview.html = initChatViewContent(this.webView,extensionURL);
				this.webView.webview.onDidReceiveMessage(message => {
					switch (message.type) {
						case 'addQA':
							this.webView.webview.postMessage({ type: 'addQA', value:  '🤖 <br/><br/>' });
							break;
					}
				}, undefined, context.subscriptions);
			}
	};

	context.subscriptions.push(vscode.window.registerWebviewViewProvider('copilotext.copilotView' , webViewProvider,  {
			webviewOptions: { retainContextWhenHidden: true }
	}));


```

除了傳統的輸入框和按鈕組合之外，我們還需要透過輸入命令的方式與WebView進行互動。 您可以註冊相關命令。


```javascript

	const ask_cmd = vscode.commands.registerCommand('copilotext.addAskResponse', async function () {

		this.webView.webview.postMessage({ type: 'addQA', value:  '🤖 <br/><br/>' });
	})

	

	
	context.subscriptions.push(ask_cmd);


```

以下是完整程式碼

```javascript

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('I am your AI assitanst !');
	
    let webView;

	let extensionURL = context.extensionUri;


	let webViewProvider={
			resolveWebviewView: (_webviewView , _webviewContex) => {
				_webviewView.webview.options={enableScripts:true};
				this.webView = _webviewView;
				this.webView.webview.html = initChatViewContent(this.webView,extensionURL);
				this.webView.webview.onDidReceiveMessage(message => {
					switch (message.type) {
						case 'addQA':
							this.webView.webview.postMessage({ type: 'addQA', value:  '🤖 <br/><br/>' });
							break;
					}
				}, undefined, context.subscriptions);
			}
	};

	
	context.subscriptions.push(vscode.window.registerWebviewViewProvider('copilotext.copilotView' , webViewProvider,  {
		webviewOptions: { retainContextWhenHidden: true }
	}));	
	
	const ask_cmd = vscode.commands.registerCommand('copilotext.addAskResponse', async function () {

		this.webView.webview.postMessage({ type: 'addQA', value:  '🤖 <br/><br/>' });
	})

	

	
	context.subscriptions.push(ask_cmd);
}


function initChatViewContent(webview ,extensionURL) {

	
	const imgUri = webview.webview.asWebviewUri(vscode.Uri.joinPath(extensionURL, 'media', 'imgs', 'icon.png'));
	const jsUri = webview.webview.asWebviewUri(vscode.Uri.joinPath(extensionURL, 'media', 'js', 'web.js'));
	
	return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <script src="${jsUri}"></script>
	  <title>🤖 Enterprise Copilot Assitant</title>
	  <style>
		  body{
				font-size:1em;
		  }
	      div {
				Padding: 4px;
		  }
	      code {
				Padding: 4px;
		  }
		  .answer {
			inline-height:600px
			overflow-y:auto;
		  }
		  .question {
            position: absolute;
            bottom: 10px;
			border:1px solid #707070;
			padding: 0.5em;
			text-align: center;
			width: 400px;
			height: auto;
		  }
		  textarea:focus{
			outline: 0;
		  }
		  textarea  
		  {
			 background: transparent;
			 border: none;
			 outline: none;
			 outline-width: 0;
			 height: 1.5em;
			 display: inline;
			 display: inline-block;
			 object-fit: contain;
			 color: #707070;
			 width:80%;
			 overflow: hidden;
			 resize: none;
			 font-size: 1.2em;
		  }
		  img {
			width: 2.5em;
			height: 2.5em;
		  }
	  </style>
  </head>
  <body>
      <h2>🤖 Enterprise Copilot Assitant</h2>
	  <p>I am your enterprise AI assistant, helping you coding and improve work efficiency</p>
	  <span>I can do</span>
	  <ul>
		<li>🔎 Code Checking</li>
		<li>📖 Code Analysis</li>
		<li>⚒️ Code Refactoring</li>
	  </ul>
	  <p id="answer"></p>
	  <center>
		<div class="question">
			<span><textarea rows="3" cols="10" wrap="soft" id="taAsk"></textarea></span>
			<span><img src="${imgUri}" id="btnASK"  /></span>
		</div>
	  </center>
	  <script>
	  		const vscode = acquireVsCodeApi(); 
			document.addEventListener('DOMContentLoaded', function(){

				document.getElementById('btnASK').addEventListener('click', function (e) {
					vscode.postMessage({type: 'addQA', value:  '🤖 <br/><br/>'});
				});
			});
	  </script>
  </body>
  </html>`;

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}



```

### **2. 替換 package.json file**

Visual Studio Code使用JSON進行頁面佈局，並透過contribute欄位繫結相關操作，例如命令、viewContainers和檢視操作。 以下是相關程式碼

```json


{
  "name": "copilotext",
  "displayName": "copilotext",
  "description": "",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.81.0"
  },
  "categories": [
    "Other"
  ],
  "activationEvents": [
  ],
  "main": "./src/extension.js",
  "contributes": {
    "commands": [{
      "command": "copilotext.addAskResponse",
      "title": "🤖 ask copilot"
    }],
    "viewsContainers": {
      "activitybar": [
        {
          "id": "copilotext",
          "title": "Enterprise Copilot",
          "icon": "media/imgs/icon.png"
        }
      ]
    },
    "views": {
      "copilotext": [
        {
          "type": "webview",
          "id": "copilotext.copilotView",
          "name": "EnpterpriseCopilot"
        }
      ]
    }
  },
  "scripts": {
    "lint": "eslint .",
    "pretest": "npm run lint",
    "test": "node ./test/runTest.js"
  },
  "devDependencies": {
    "@types/vscode": "^1.81.0",
    "@types/mocha": "^10.0.1",
    "@types/node": "16.x",
    "eslint": "^8.47.0",
    "glob": "^10.3.3",
    "mocha": "^10.2.0",
    "typescript": "^5.1.6",
    "@vscode/test-electron": "^2.3.4"
  }
}

```


### **3. 新增 web.js**

新增 web.js 到 meida/js


```javascript

(function () {

    // @ts-ignore
    window.addEventListener("message", (event) => {
        const message = event.data;
        console.log(message);
        switch (message.type) {
          case "addQA": {
            const divTag = document.createElement('div');
            const brTag = document.createElement('br');
            divTag.innerHTML = '🧑:  <br/><br/> ' + document.getElementById('taAsk').value + '<br/><br/>';
            divTag.innerHTML += '🤖: <br/><br/> '  + document.getElementById('taAsk').value + '<br/><br/>';
            document.getElementById("answer").appendChild(divTag).appendChild(brTag);
            break;
          }
        }
    });


})();

```





### **3. 再次執行執行和除錯**


![image](/imgs/01/07.png)


🎉🎉🎉 您現已完成屬於您的 Enterprise Copilot Visual Studio Code 外掛


### **4.  與 Enterprise Copilot 進行問答互動**


![image](/imgs/01/08.png)


![image](/imgs/01/09.png)

🦸🦸恭喜，您已經初步完成了頁面佈局的建構。 接下來，我們將繼續連線 Azure OpenAI 服務。













