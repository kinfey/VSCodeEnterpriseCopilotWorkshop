# **将 Semantic Kernel 添加到 Visual Studio Code 插件**

## **介绍 Semantic Kernel**

![image](/imgs/02/sk.png)

在 2023 年 5 月的 Microsoft Build 大会上，微软发布了适用于 LLM 应用程序的 Copilot Stack。 为大家通过大模型构建应用指明了方向。 Semantic Kernel 是实现 Copilot Stack 的最佳框架（这有点片面，但不可否认我是 Semantic Kernel 的狂热分子）。 有人问我，为什么不用 LangChain ？ 不可否认，LangChain 是一个很好的框架。 它更多地以人工智能的方式解决人工智能问题，但语义内核更好地弥合了代码和提示之间的差距，并且非常适合高度工程化的项目。 如果想了解更多关于 Semantic Kernel 的知识，可以去Semantic Kernel的GitHub进行学习（https://github.com/microsoft/semantic-kernel）

**如何向 Visual Studio Code 扩展添加 Semantic Kernel 支持**

我们知道 Semantic Kernel 已经支持 .NET、Python 和 Java。 但是对于严重依赖 JavaScript 和 TypeScript 的 Visual Studio Code Extension 开发，我们该怎么办呢？ 我非常感谢开源世界。 这里是微软官方的https://github.com/microsoft/node-api-dotnet，它可以让我们直接将.NET迁移到NodeJS技术体系上。 本次Workshop参考https://github.com/microsoft/node-api-dotnet完成相关扩展案例。


**环境设定**

1. git clone https://github.com/microsoft/node-api-dotnet.git

2. 在根目录下创建ext文件夹，将 Workshop 第一步的代码复制到该文件夹中

3. 根目录下，将examples文件夹中的 Directory.Build.props 和 NuGet.config 复制到ext目录下

4. 进入 ext/copilotext 目录，创建 copilotext.csproj

5. 将以下代码复制到 copilotext.csproj


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
    <PackageReference Include="Microsoft.SemanticKernel" Version="1.0.0-beta6" />
    <PackageReference Include="Microsoft.JavaScript.NodeApi.Generator" Version="0.4.19" />
  </ItemGroup>

</Project>

```

6. 在 Visual Studio Code下打开终端，进入copilotext文件夹，依次输入以下命令



```bash
dotnet pack ../.. 

dotnet build

npm install 
```

7. 打开 copilotext 下的 package.json 文件夹并添加以下节点（在 scripts 之前）


```json

  "dependencies": {
    "node-api-dotnet": "file:../../out/pkg/node-api-dotnet"
  },

```

基本环境配置完成。 有几件事需要注意。

1. 建议安装 .NET 8 
2. 有时编译时可能会遇到C++问题。 推荐安装Windows C++开发环境。


**导入 Semantic Kernel**

1. 使用 Visual Studio Code 创建一个新窗口并打开copilotext文件夹

2. 在 ackage.json 中添加 Azure OpenAI Service 相关信息（Endpoint、Key、Model）


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


3. 将 semantic-kernel.js 添加到src文件夹中


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

4. 在copilotext 目录中新建 skills 文件夹，在 skill 目录中添加CodeSkill 文件夹，然后在 docsskill 目录中添加 Translate 文件夹。

5. 在 translate 目录下添加 skprompt.txt 和 config.json

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

6. 在 src 文件夹中添加 enterprise-copilot.js


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
const kernel = SK.OpenAIKernelBuilderExtensions.WithAzureOpenAIChatCompletionService(SK.Kernel.Builder, gptModel,endPoint, apiKey).Build();
const pluginsDirectory = path.join(__dirname,'../plugins');
const plugins = ['CodePlugin'];
const code_plugin = SK.KernelSemanticFunctionExtensions.ImportSemanticSkillFromDirectory(kernel,pluginsDirectory,plugins);




async function CheckCodeBySK(code,style) {
    
    const codeFunction = code_plugin.get(style);
    
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

8. 再次运行，哦你的Enterprise GitHub Copilot现在可以成为你的翻译了 [完整代码](./code/02/kickoff)


![image](/imgs/02/translate.png)


但这是一个代码编辑器。 我们需要的不仅仅是一名翻译。 我们可以通过添加不同的Skill来增强我们的企业级编程能力。 如果您有兴趣，可以运行[code/02/final](./code/02/final)文件夹中的项目。 当您打开代码并单击鼠标右键时，您可以添加代码分析、检查和重构功能。 或者这是您最终的企业级 Copilot 实施吗？


![image](/imgs/02/code.png)

🦸🦸 恭喜！！！您已经学会了自定义一个类似于 GitHub Copilot Chat 的 Visual Studio Code Extension。 接下来我们将定制企业级功能。


