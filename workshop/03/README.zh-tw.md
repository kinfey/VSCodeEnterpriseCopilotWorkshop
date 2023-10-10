# **將 Promptflow 新增到 Visual Studio Code 外掛**

在 Copilot Stack 中解決問題的關鍵是提示。 我們在前端有 Prompt，它可以是諸如“幫我提取這段程式碼，分析它，並將其轉換為 Python”之類別的指令組合。 我們可以利用Semantic Kernel的Planner將其分為三個步驟：程式碼提取、分析、轉換為Python。 這三個步驟中的每一個都包含一個簡單的流程。 我們有大量的Flows來解決後端應用中的業務問題。 通常這些流程由固定提示組成。 如果我們嘗試用微服務來拆解它，就會發現有很多相似之處。

除了Semantic Kernel框架之外，微軟還發布了Promptflow。 及時解決是解決問題的關鍵。 您可以使用 Promptflow 來標準化相關內容。

## **PromptFlow**

Prompt flow 是一套開發工具，旨在簡化基於 LLM 的人工智慧應用程式的端到端開發週期，從構思、原型設計、測試、評估到生產部署和監控。 它使即時工程變得更加容易，並使您能夠建構具有生產品質的 LLM 應用程式。

以上文字來自PromptFlow文件（https://microsoft.github.io/promptflow/）。 以我的理解，Promptflow更適合基於後端的業務邏輯。

我們車間的企業副駕駛已經成型，但對於企業來說還遠遠不夠。 畢竟企業可以溝通文件、產生文件、擁有自己的編碼風格，這些都可以透過客製來完成。 在上一個練習中，我們在本地放置了一些Prompt處理，但是透過Promptflow我們可以使用雲原生方法來完成更多操作。

## **以雲原生方式建構文件聊天**

Promptflow 現在不僅限於 Azure，還可以在本地和容器中使用，這意味著它更加靈活。 我們可以更加專注於發展。

安裝 Promptflow 非常簡單。 您可以安裝 Promptflow for Visual Studio Code 的擴充並選擇“安裝依賴項”。 可以看到非常清晰的安裝說明。 我這裡就不一一描述了。

這裡有一個準備工作。 您可以參考我的Microsoft Fabric部落格首先使用SK將知識匯入和提取到Microsoft Cognitive Search中。 （https://blog.fabric.microsoft.com/en-us/blog/use-semantic-kernel-with-lakehouse-in-microsoft-fabric）

讓我們建立一個 Chatflow 。

1. 建立 ChatFlow


![image](/imgs/03/01.png)

2. 建立連結

Promptflow 支援不同的連結。 此處需要配置 Azure OpenAI 連線和 Azure 認知搜尋連線。 這裡只需要新增連結即可。 金鑰在命令列中輸入。


![image](/imgs/03/02.png)

3. 瞭解 Promptflow 專案的結構



![image](/imgs/03/03.png)


Promptflow的主要檔案：

a. .py - 用於與邏輯和 LLM 互動的 Python 檔案

b. .jinja2 - 這是提示的設定。 裡面可以寫Prompt，模型教育時會繫結。

c. flow.dag.yaml - 這個檔案非常有趣。 您可以設定執行流程的順序，並且可以選擇以視覺化形式檢視檔案。

如果你想了解更多，可以檢視https://microsoft.github.io/promptflow/how-to-guides/develop-a-flow/develop-standard-flow.html



4. 建議您直接開啟範例專案 [在此下載](./code/03/vscode-chatflow)
  並直接執行即可檢視。 當然，您必須確保您的連線配置正確。 （不要忘記首先執行 pip install -r request.txt）

5. 在flow.dag.yaml中可以選擇run、debug、deploy，完成promptflow除錯。

![image](/imgs/03/04.png)

6. 本地執行就可以看到聊天介面


![image](/imgs/03/05.png)

7. 透過 http://localhost:8080/swagger.json 瞭解呼叫介面

![image](/imgs/03/06.png)

8. 新增到 Visual Studio Code 外掛

安裝 note-fetch

```bash

npm install node-fetch@2    


```

更新 copilotenterprise.js 

```js

const fetch = require('node-fetch');

.........

async function RunPlanner(qa){

    const myUrl = 'http://127.0.0.1:8080/score';
    const myData = {"question":qa};
  
    const response = await fetch(myUrl, {
      method: 'POST',
      body: JSON.stringify(myData),
    }).then((response) => response.json());
  
    //console.log(response);

    return response.answer;


}


```

更改 copilotenterprise.js 


```js

const {RunInSemanticKernel,RunPlanner} = require('./enterprisecopilot.js');

.........


	let webViewProvider={
			resolveWebviewView: (_webviewView , _webviewContex) => {
				_webviewView.webview.options={enableScripts:true};
				this.webView = _webviewView;
				this.webView.webview.html = initChatViewContent(this.webView,extensionURL);
				this.webView.webview.onDidReceiveMessage( async message => {
					switch (message.type) {
						case 'addQA':
							
							const result =  await RunPlanner(message.value); //await RunInSemanticKernel(message.value,"Translate");
							const strQA = '🧑:  <br/>' + message.value + '<br/>' + '🤖: <br/>'  + result + '<br/>';
							this.webView.webview.postMessage({ type: 'addQA', value:  strQA });
							break;
					}
				}, undefined, context.subscriptions);
			}
	};


```

執行


![image](/imgs/03/07.png)

太棒了，您已經可以做更多的客製工作了。 當然，這個工作坊只是你的第一步，或者我們不僅僅是使用Semantic Kernel，與Promptflow結合還有更多的可能性。


