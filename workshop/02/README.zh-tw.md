# **將 Semantic Kernel 新增到 Visual Studio Code 外掛**

## **介紹 Semantic Kernel**

![image](/imgs/02/sk.png)

在 2023 年 5 月的 Microsoft Build 大會上，微軟釋出了適用於 LLM 應用程式的 Copilot Stack。 為大家透過大模型建構應用指明瞭方向。 Semantic Kernel 是實現 Copilot Stack 的最佳框架（這有點片面，但不可否認我是 Semantic Kernel 的狂熱分子）。 有人問我，為什麼不用 LangChain ？ 不可否認，LangChain 是一個很好的框架。 它更多地以人工智慧的方式解決人工智慧問題，但語義核心更好地彌合了程式碼和提示之間的差距，並且非常適合高度工程化的專案。 如果想了解更多關於 Semantic Kernel 的知識，可以去Semantic Kernel的GitHub進行學習（https://github.com/microsoft/semantic-kernel）

**如何向 Visual Studio Code 擴充新增 Semantic Kernel 支援**

我們知道 Semantic Kernel 已經支援 .NET、Python 和 Java。 但是對於嚴重依賴 JavaScript 和 TypeScript 的 Visual Studio Code Extension 開發，我們該怎麼辦呢？ 我非常感謝開源世界。 這裡是微軟官方的https://github.com/microsoft/node-api-dotnet，它可以讓我們直接將.NET遷移到NodeJS技術體系上。 本次Workshop參考https://github.com/microsoft/node-api-dotnet完成相關擴充案例。


**環境設定**

1. git clone https://github.com/microsoft/node-api-dotnet.git

2. 在根目錄下建立ext資料夾，將 Workshop 第一步的程式碼複製到該資料夾中

3. 根目錄下，將examples資料夾中的 Directory.Build.props 和 NuGet.config 複製到ext目錄下

4. 進入 ext/copilotext 目錄，建立 copilotext.csproj

5. 將以下程式碼複製到 copilotext.csproj


```bash

<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>
    <RestorePackagesPath>$(MSBuildThisFileDirectory)/pkg</RestorePackagesPath>
    <OutDir>bin</OutDir>
    <NodeApiAssemblyJSModuleType>esm</NodeApiAssemblyJSModuleType>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.SemanticKernel" Version="0.24.230912.2-preview" />
    <PackageReference Include="Microsoft.JavaScript.NodeApi.Generator" Version="0.4.4" />
  </ItemGroup>

</Project>

```

6. 在 Visual Studio Code下開啟終端，進入copilotext資料夾，依次輸入以下命令



```bash
dotnet pack ../.. 

dotnet build

npm install 
```

7. 開啟 copilotext 下的 package.json 資料夾並新增以下節點（在 scripts 之前）


```json

  "dependencies": {
    "node-api-dotnet": "file:../../out/pkg/node-api-dotnet"
  },

```

基本環境配置完成。 有幾件事需要注意。

1. 建議安裝.NET 6、.NET 7、.NET 8 RC 1
2. 有時編譯時可能會遇到C++問題。 推薦安裝Windows C++開發環境。


**匯入 Semantic Kernel**

1. 使用 Visual Studio Code 建立一個新視窗並開啟copilotext資料夾

2. 在 ackage.json 中新增 Azure OpenAI Service 相關資訊（Endpoint、Key、Model）


```json

    "configuration": {
      "type": "object",
      "title": "copilotext",
      "properties": {
        "copilotext.endpoint": {
          "type": "string",
          "default": "Your Azure OpenAI Endpoint",
          "description": "Your Azure OpenAI Endpoint",
          "order": 0
        },
        "copilotext.api_key": {
          "type": "string",
          "default": "Your Azure OpenAI KEY",
          "description": "Your Azure OpenAI KEY",
          "order": 1
        },
        "copilotext.chatgptmodel": {
          "type": "string",
          "default": "Your ChatGPT Model",
          "description": "Your ChatGPT Model",
          "order": 2
        }
      }
    }

```


3. 將 semantic-kernel.js 新增到src資料夾中


```json


const fs = require('node:fs');
const path = require('node:path');
const dotnet = require('node-api-dotnet');

const skAssemblyName = 'Microsoft.SemanticKernel.Core';
const skOpenAIAssemblyName = 'Microsoft.SemanticKernel.Connectors.AI.OpenAI';

/** All assemblies are resolved from the bin directory, where they were copied by MSBuild. */
function resolveAssembly(name) {
  console.log(path.join('../bin', name + '.dll'));
  return path.join(__dirname,'../bin', name + '.dll');
}

dotnet.addListener('resolving', (name) => {
  const filePath = resolveAssembly(name);
  if (fs.existsSync(filePath)) dotnet.load(filePath);
});

/** @type import('../bin/Microsoft.SemanticKernel.Core') */
dotnet.load(resolveAssembly(skAssemblyName));
/** @type import('../bin/Microsoft.SemanticKernel.Connectors.AI.OpenAI') */
dotnet.load(resolveAssembly(skOpenAIAssemblyName));

```

4. 在copilotext 目錄中新建 skills 資料夾，在 skill 目錄中新增CodeSkill 資料夾，然後在 docsskill 目錄中新增 Translate 資料夾。

5. 在 translate 目錄下新增 skprompt.txt 和 config.json

skprompt.txt

```txt

You are a professional translator, help me translate the {{$input}} into Chinese

[INPUT]
Hi
[END INPUT]
[OUTPUT]
你好
[END OUTPUT]
[INPUT]
{{$input}}
[END INPUT]

```

config.json

```json

{
    "schema": 1,
    "type": "completion",
    "description": "Translates English to Chinese",
    "completion": {
      "max_tokens": 1300,
      "temperature": 0.3,
      "presence_penalty": 0.0,
      "frequency_penalty": 0.0
    }
}

```

6. 在 src 資料夾中新增 enterprise-copilot.js


```js

const vscode = require('vscode');
const path = require('node:path');
const dotnet = require('node-api-dotnet');
require('./semantic-kernel.js');


const SK = dotnet.Microsoft.SemanticKernel;
const config = vscode.workspace.getConfiguration('copilotext');
const endPoint = config.get('endpoint');
const apiKey = config.get('api_key');
const gptModel = config.get('chatgptmodel');
const kernel = SK.OpenAIKernelBuilderExtensions.WithAzureChatCompletionService(SK.Kernel.Builder, gptModel,endPoint, apiKey).Build();
const skillsDirectory = path.join(__dirname,'../skills');
const code_skill = SK.ImportSemanticSkillFromDirectoryExtension.ImportSemanticSkillFromDirectory(kernel,skillsDirectory,['codeskill']);



async function CheckCodeBySK(code,style) {
    
    const codeFunction = code_skill.get(style);
    
    const context_variable = new SK.Orchestration.ContextVariables(code);

    const context = new SK.Orchestration.SKContext(context_variable);

    const answer = await codeFunction.InvokeAsync(context);

    
    return answer.ToString();

}


module.exports = CheckCodeBySK;


```

7. Update extension.js & web.js  file

extension.js

```js

const vscode = require('vscode');
const RunInSemanticKernel = require('./enterprisecopilot.js');
require('./semantic-kernel.js');
require('./enterprisecopilot.js');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('I am your AI assitanst !');
	
    let webView;

	let extensionURL = context.extensionUri;


	let webViewProvider={
			resolveWebviewView: (_webviewView , _webviewContex) => {
				_webviewView.webview.options={enableScripts:true};
				this.webView = _webviewView;
				this.webView.webview.html = initChatViewContent(this.webView,extensionURL);
				this.webView.webview.onDidReceiveMessage( async message => {
					switch (message.type) {
						case 'addQA':
							
							const result = await RunInSemanticKernel(message.value,"Translate");
							const strQA = '🧑:  <br/><br/> ' + message.value + '<br/><br/>' + '🤖: <br/><br/> '  + result + '<br/><br/>';
							this.webView.webview.postMessage({ type: 'addQA', value:  strQA });
							break;
					}
				}, undefined, context.subscriptions);
			}
	};
	
	context.subscriptions.push(vscode.window.registerWebviewViewProvider('copilotext.copilotView' , webViewProvider,  {
		webviewOptions: { retainContextWhenHidden: true }
	}));	
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
					vscode.postMessage({type: 'addQA', value:  document.getElementById('taAsk').value});
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

web.js

```js

(function () {

    // @ts-ignore
    window.addEventListener("message", (event) => {
        const message = event.data;
        console.log(message);
        switch (message.type) {
          case "addQA": {
            const divTag = document.createElement('div');
            const brTag = document.createElement('br');
            divTag.innerHTML = message.value;
            // divTag.innerHTML += '🤖: <br/><br/> '  + message.value + message.value + '<br/><br/>';
            document.getElementById("answer").appendChild(divTag).appendChild(brTag);
            document.getElementById("taAsk").value = "";
            break;
          }
        }
    });


})();

```

8. 再次執行，哦你的Enterprise GitHub Copilot現在可以成為你的翻譯了 [完整程式碼](./code/02/kickoff)


![image](/imgs/02/translate.png)


但這是一個程式碼編輯器。 我們需要的不僅僅是一名翻譯。 我們可以透過新增不同的Skill來增強我們的企業級程式設計能力。 如果您有興趣，可以執行[code/02/final](./code/02/final)資料夾中的專案。 當您開啟程式碼並單擊滑鼠右鍵時，您可以新增程式碼分析、檢查和重構功能。 或者這是您最終的企業級 Copilot 實施嗎？


![image](/imgs/02/code.png)

🦸🦸 恭喜！！！您已經學會了自訂一個類似於 GitHub Copilot Chat 的 Visual Studio Code Extension。 接下來我們將客製企業級功能。


