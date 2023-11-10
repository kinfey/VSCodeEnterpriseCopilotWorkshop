# **Add Semantic Kernel to Visual Studio Code Extension**

## **Introduction Semantic Kernel**

![image](/imgs/02/sk.png)

At Microsoft Build in May 2023, Microsoft released Copilot Stack for LLM applications. It pointed out the direction for everyone to build applications through large models. Semantic Kernel is the best framework to implement Copilot Stack (this is a bit one-sided, but I am undeniably a Semantic Kernel fanatic). Someone asked me, why not LangChain? It is undeniable that LangChain is a good framework. It solves AI problems more in an AI way, but Semantic Kernel better bridges the gap between code and prompts, and is very good for highly engineered projects. role. If you want to learn more about Semantic Kernel, you can go to Semantic Kernel’s GitHub to learn （https://github.com/microsoft/semantic-kernel）

**How to add Semantic Kernel support to a Visual Studio Code extension**

We know that Semantic Kernel already supports .NET, Python, and Java. But for the development of Visual Studio Code Extension that relies heavily on JavaScript and TypeScript, what should we do? I am very grateful to the open source world. Here is Microsoft’s official https://github.com/microsoft/node-api-dotnet, which allows us to directly migrate .NET to the NodeJS technology system. This Workshop refers to https://github.com/microsoft/node-api-dotnet to complete related extension cases.


**Environment settings**

1. git clone https://github.com/microsoft/node-api-dotnet.git

2. In the root directory, create the ext folder and copy the code from the first step of the Workshop into the folder

3. In the root directory, copy Directory.Build.props and NuGet.config in the examples folder to the ext directory

4. Enter the ext/copilotext directory and create copilotext.csproj

5. Copy the following code to copilotext.csproj


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

6.  Open the terminal under Visual Studio Code, goto the copilotext folder, and enter the following commands in sequence



```bash
dotnet pack ../.. 

dotnet build

npm install 
```

7. Open the package.json folder under copilotext and add the following nodes(before "scripts")


```json

  "dependencies": {
    "node-api-dotnet": "file:../../out/pkg/node-api-dotnet"
  },

```

The basic environment configuration is complete. There are a few things to pay attention to.

1. It is recommended to install .NET 8
2. Sometimes you may encounter C++ problems during compilation. It is recommended to install the Windows C++ development environment.


**Import Semantic Kernel**

1. Create a new window using Visual Studio Code and open the copilotext folder

2. Add Azure OpenAI Service related information in package.json ( Endpoint, Key , Model)


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


3. Add semantic-kernel.js to the src folder


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

4. Create a new skills folder in the copilotext directory, add the CodeSkill folder in the skill directory, and then add the Translate folder in the docsskill directory.

5. Add skprompt.txt and config.json in the translate directory

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

6. Add enterprise-copilot.js in src folder


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

8. Run again ， oh Your Enterprise GitHub Copilot can be your translator now [Download Code](./code/02/kickoff)


![image](/imgs/02/translate.png)


But this is a code editor. We need more than just a translator. We can enhance our enterprise-level programming capabilities by adding different Skills. If you are interested, you can run the project in the [code/02/final](./code/02/final) folder. When you open the code and right-click the mouse, you can add code analysis, inspection, and refactoring capabilities. Or is this your ultimate enterprise-grade Copilot implementation?


![image](/imgs/02/code.png)

🦸🦸 Congratulations ！！！ You have learned to customize a Visual Studio Code Extension similar to GitHub Copilot Chat. Next we will customize enterprise-level functions.


