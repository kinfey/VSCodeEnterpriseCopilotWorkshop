# **Visual Studio Code 插件开发**


Visual Studio Code 是一个非常流行的开源开发工具。 通过安装不同的扩展，可以完成不同编程语言的支持、DevOps等相关工作。 作为开发人员，您每天都离不开 Visual Studio Code。 在这里，我们将了解Visual Studio Code Extension是如何开发的。

## **环境配置**

1. 安装 NodeJS 18+

2. 打开命令行并执行以下命令安装 Visual Studio Code 插件支持

```bash
npm install -g yo generator-code
```

3. 从命令行创建 Visual Studio Code 插件项目

```bash
yo code
```

命令行中将显示以下选项

![image](/imgs/01/01.png)

Visual Studio Code Extensions 支持 TypeScript 和 JavaScript 开发，本次 Workshop 使用 JavaScript。

请按照此图片完成设置

![image](/imgs/01/02.png)

创建完成后，选择Visual Studio Code打开项目

![image](/imgs/01/03.png)

选择运行，按Ctrl+Shift+P，输入Hello World，如下图，项目创建完成。

![image](/imgs/01/04.png)


## **VSCode 插件相关文件**

### **package.json**

除了与 Visual Studio Code Extension 相关的 node 包外，您还可以通过 package.json 管理与 Visual Studio Code Extension 相关的节点包。 您还可以在此处设置项目文件、响应事件绑定、布局和相关设置，例如 Azure OpenAI 的 Endpoint 和 Key。

### **extensions.js**

这是 Visual Studio Code 插件的实际逻辑实现。 这是核心文件，默认放置在根目录下，但是我们可以将该文件放置在其他文件夹中，例如设置一个./src文件。

![image](/imgs/01/05.png)

修改 package.json，在 main 中设置新位置


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


## **复制一个 GitHub Copilot Chat 界面**

![image](/imgs/01/06.png)

您使用过 GitHub Copilot Chat 吗？ 你可以一边聊天一边结合自己的业务，完成编写程序的工作。 企业级的副驾驶或者您可能需要类似的界面。 接下来我们开始在 Visual Studio Code Extension 中构建类似的界面。

我们知道 Visual Studio Code 是建立在 Electron 框架之上的。 所以本质上该界面是一个WebView。 我们需要进行Visual Studio Code编程，更多的是基于Web UI的实现。

### **1. 在 extensions.js 添加 WebView **

*添加 initChatViewContent 方法*

我们希望模仿 GitHub Copilot Chat 的实现，在左侧菜单上构建一个聊天界面。 我们需要初始化控制激活函数。 我们通过Webview来实现。 我们通过WebViewProvider以及WebView对应的显示事件来设置显示内容。


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

除了传统的输入框和按钮组合之外，我们还需要通过输入命令的方式与WebView进行交互。 您可以注册相关命令。


```javascript

	const ask_cmd = vscode.commands.registerCommand('copilotext.addAskResponse', async function () {

		this.webView.webview.postMessage({ type: 'addQA', value:  '🤖 <br/><br/>' });
	})

	

	
	context.subscriptions.push(ask_cmd);


```

以下是完整代码

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

### **2. 替换 package.json file**

Visual Studio Code使用JSON进行页面布局，并通过contribute字段绑定相关操作，例如命令、viewContainers和视图操作。 以下是相关代码

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


### **3. 添加 web.js**

添加 web.js 到 meida/js


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





### **3. 再次执行运行和调试**


![image](/imgs/01/07.png)


🎉🎉🎉 您现已完成属于您的 Enterprise Copilot Visual Studio Code 插件


### **4.  与 Enterprise Copilot 进行问答互动**


![image](/imgs/01/08.png)


![image](/imgs/01/09.png)

🦸🦸恭喜，您已经初步完成了页面布局的构建。 接下来，我们将继续连接 Azure OpenAI 服务。













