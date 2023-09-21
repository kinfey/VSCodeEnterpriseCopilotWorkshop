# **Add Promptflow to Visual Studio Code Extension**

The key to solving problems in Copilot Stack is Prompt. We have Prompt on the front end, which can be a combination of instructions such as "Help me extract this code, analyze it, and convert it to Python". We can use Semantic Kernel's Planner to divide it into three steps: code extraction, analysis, and conversion to Python. Each of these three steps consists of a simple Flow. We have a large number of Flows that solve business problems in back-end applications. Usually these flows are composed of fixed prompts. If we try to disassemble it using microservices, there are many similarities.

In addition to the Semantic Kernel framework, Microsoft also released Promptflow. Prompt is the key to solving the problem. You can use Promptflow to standardize related content.

## **Introduce PromptFlow**

Prompt flow is a suite of development tools designed to streamline the end-to-end development cycle of LLM-based AI applications, from ideation, prototyping, testing, evaluation to production deployment and monitoring. It makes prompt engineering much easier and enables you to build LLM apps with production quality.

The above words are from the PromptFlow document (https://microsoft.github.io/promptflow/). In my understanding, Promptflow is more suitable for back-end-based business logic.

The Enterprise Copilot in our workshop has taken shape, but it is far from enough for enterprises. After all, enterprises can communicate documents, generate documents, and have their own coding style, which can all be completed through customization. In the previous exercise, we placed some Prompt processing locally, but with Promptflow we can use cloud native methods to complete more operations.


## **Build documents in a cloud-native way Chat**

Promptflow is now not just limited to Azure, but can also be used on-premises and in containers, which means it is more flexible. We can focus more on development.

Installing Promptflow is very simple. You can install the Extension of Promptflow for Visual Studio Code and select Install Dependence. You can see very clear installation instructions. I won’t describe them one by one here.

Here is a preparation work. You can refer to my Microsoft Fabric Blog to first use SK to import and extract knowledge into Microsoft Cognitive Search. （https://blog.fabric.microsoft.com/en-us/blog/use-semantic-kernel-with-lakehouse-in-microsoft-fabric）

When you've finished logging, let's create a Chatflow .

1. Create ChatFlow


![image](/imgs/03/01.png)

2. Make Connections

Promptflow supports different links. Here you need to configure Azure OpenAI Connection and Azure Cognitive Search Connection. Here you only need to add the link. The Key is entered on the command line.


![image](/imgs/03/02.png)

3. Understand the structure of Promptflow projects



![image](/imgs/03/03.png)


Main files of Promptflow:

a. .py - Python files for interacting with logic and LLM

b. .jinja2 - This is the setting of Prompt. You can write Prompt in it, which will be bound during model education.

c. flow.dag.yaml - This file is very interesting. You can set the order of execution flow, and you can choose to view the file into a visualization.

If you want to know more, you can see https://microsoft.github.io/promptflow/how-to-guides/develop-a-flow/develop-standard-flow.html



4. It is recommended that you directly open the sample project and run it directly to view. Of course, you must ensure that your Connection is configured correctly. (Don't forget to run pip install -r requirement.txt firstly)

5. You can select run, debug, and deploy in flow.dag.yaml to complete promptflow debugging.

![image](/imgs/03/04.png)

6. Run it locally and you can see the chat interface


![image](/imgs/03/05.png)

7. Learn how to call the interface through http://localhost:8080/swagger.json

![image](/imgs/03/06.png)

8. Added to Visual Studio Code Extension

Install note-fetch

```bash

npm install node-fetch@2    


```

Update copilotenterprise.js 

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

Change copilotenterprise.js 


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

Run it


![image](/imgs/03/07.png)

Great, you can already do more customization work. Of course, this workshop is just your first step, or we are not just using Semantic Kernel, there are more possibilities when combined with Promptflow.


