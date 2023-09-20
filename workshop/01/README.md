# **Visual Studio Code Extension Development**


Visual Studio Code is a very popular open source development tool. By installing different extensions, you can complete different programming language support, Devops and other related work. As a developer, you can't live without Visual Studio Code every day. Here, we will learn how the Visual Studio Code Extension is developed.

## **Environment**

1. Install NodeJS 18+

2. Open the command line and execute the following command to install Visual Studio Code Extension support

```bash
npm install -g yo generator-code
```

3. Create a Visual Studio Code Extension project from the command line


```bash
yo code
```

The following options will be displayed on the command line

![image](/imgs/01/01.png)

Visual Studio Code Extensions support TypeScript and JavaScript development, and the Workshop uses JavaScript. 

Please follow this images to complete the settings

![image](/imgs/01/02.png)

After creation, select Visual Studio Code to open the project

![image](/imgs/01/03.png)

Select Run, press Ctrl + Shift + P, enter Hello World, and as shown below, the project creation is completed.

![image](/imgs/01/04.png)


## **VSCode Extension files**

### **package.json**

In addition to the node packages related to Visual Studio Code Extension, you can manage the node packages related to Visual Studio Code Extension through package.json. You can also set the project files, response event binding, layout and related settings such as Azure OpenAI's Endpoint and Key here.

### **extensions.js**

This is the logical implementation of the Visual Studio Code Extension in action. This is the core file and is placed in the root directory by default, but we can place the file in other folders, such as setting a ./src file.

![image](/imgs/01/05.png)

and modify package.json, set new location in main object 


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


## **Build UI like GitHub Copilot Chat**

![image](/imgs/01/06.png)

Have you used GitHub Copilot Chat? You can combine your business while chatting and complete the work of writing programs. Copilot for enterprise level or you may need a similar interface. Next we start building a similar interface in Visual Studio Code Extension.

We know that Visual Studio Code is built on the Electron Framework. So essentially the interface is a WebView. We need to program Visual Studio Code, and we are more based on the implementation of Web UI.

### **1. Add WebView in extensions.js**

*add initChatViewContent function*

We hope to imitate the implementation of GitHub Copilot Chat and build a chat interface on the left menu. We need to initialize the control activation function. We implement it through Webview. We set the display content through WebViewProvider and the corresponding display events of WebView.



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

In addition to the traditional combination of input boxes and buttons, we need to interact with WebView by entering commands. You can register related commands.


```javascript

	const ask_cmd = vscode.commands.registerCommand('copilotext.addAskResponse', async function () {

		this.webView.webview.postMessage({ type: 'addQA', value:  '🤖 <br/><br/>' });
	})

	

	
	context.subscriptions.push(ask_cmd);


```

The following is the complete code

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

### **2. Replace package.json file**

Visual Studio Code uses JSON for page layout and binds related operations through the contribute field, such as commands, viewContainers, and views operations. The following is the relevant code


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


### **2. Replace package.json file**

Add web.js to src


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





### **3. Run Debug again**


![image](/imgs/01/07.png)


🎉🎉🎉 You finished your Enterprise Copilot Visual Studio Code Extensions Now


### **4.  QA interaction with your Enterprise Copilot**


![image](/imgs/01/08.png)


![image](/imgs/01/09.png)

🦸🦸Congratulations, you have initially completed the construction of the page layout. Next, we will proceed to connect with Azure OpenAI Services.













