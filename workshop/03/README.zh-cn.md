# **将 Promptflow 添加到 Visual Studio Code 插件**

在 Copilot Stack 中解决问题的关键是提示。 我们在前端有 Prompt，它可以是诸如“帮我提取这段代码，分析它，并将其转换为 Python”之类的指令组合。 我们可以利用Semantic Kernel的Planner将其分为三个步骤：代码提取、分析、转换为Python。 这三个步骤中的每一个都包含一个简单的流程。 我们有大量的Flows来解决后端应用中的业务问题。 通常这些流程由固定提示组成。 如果我们尝试用微服务来拆解它，就会发现有很多相似之处。

除了Semantic Kernel框架之外，微软还发布了Promptflow。 及时解决是解决问题的关键。 您可以使用 Promptflow 来标准化相关内容。

## **PromptFlow**

Prompt flow 是一套开发工具，旨在简化基于 LLM 的人工智能应用程序的端到端开发周期，从构思、原型设计、测试、评估到生产部署和监控。 它使即时工程变得更加容易，并使您能够构建具有生产质量的 LLM 应用程序。

以上文字来自PromptFlow文档（https://microsoft.github.io/promptflow/）。 以我的理解，Promptflow更适合基于后端的业务逻辑。

我们车间的企业副驾驶已经成型，但对于企业来说还远远不够。 毕竟企业可以沟通文档、生成文档、拥有自己的编码风格，这些都可以通过定制来完成。 在上一个练习中，我们在本地放置了一些Prompt处理，但是通过Promptflow我们可以使用云原生方法来完成更多操作。

## **以云原生方式构建文档聊天**

Promptflow 现在不仅限于 Azure，还可以在本地和容器中使用，这意味着它更加灵活。 我们可以更加专注于发展。

安装 Promptflow 非常简单。 您可以安装 Promptflow for Visual Studio Code 的扩展并选择“安装依赖项”。 可以看到非常清晰的安装说明。 我这里就不一一描述了。

这里有一个准备工作。 您可以参考我的Microsoft Fabric博客首先使用SK将知识导入和提取到Microsoft Cognitive Search中。 （https://blog.fabric.microsoft.com/en-us/blog/use-semantic-kernel-with-lakehouse-in-microsoft-fabric）

让我们创建一个 Chatflow 。

1. 创建 ChatFlow


![image](/imgs/03/01.png)

2. 建立链接

Promptflow 支持不同的链接。 此处需要配置 Azure OpenAI 连接和 Azure 认知搜索连接。 这里只需要添加链接即可。 密钥在命令行中输入。


![image](/imgs/03/02.png)

3. 了解 Promptflow 项目的结构



![image](/imgs/03/03.png)


Promptflow的主要文件：

a. .py - 用于与逻辑和 LLM 交互的 Python 文件

b. .jinja2 - 这是提示的设置。 里面可以写Prompt，模型教育时会绑定。

c. flow.dag.yaml - 这个文件非常有趣。 您可以设置执行流程的顺序，并且可以选择以可视化形式查看文件。

如果你想了解更多，可以查看https://microsoft.github.io/promptflow/how-to-guides/develop-a-flow/develop-standard-flow.html



4. 建议您直接打开示例项目 [在此下载](./code/03/vscode-chatflow)
  并直接运行即可查看。 当然，您必须确保您的连接配置正确。 （不要忘记首先运行 pip install -r request.txt）

5. 在flow.dag.yaml中可以选择run、debug、deploy，完成promptflow调试。

![image](/imgs/03/04.png)

6. 本地运行就可以看到聊天界面


![image](/imgs/03/05.png)

7. 通过 http://localhost:8080/swagger.json 了解调用接口

![image](/imgs/03/06.png)

8. 添加到 Visual Studio Code 插件

安装 note-fetch

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

运行


![image](/imgs/03/07.png)

太棒了，您已经可以做更多的定制工作了。 当然，这个工作坊只是你的第一步，或者我们不仅仅是使用Semantic Kernel，与Promptflow结合还有更多的可能性。


