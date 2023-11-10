# **🛠️ 创建适用于企业的 Visual Studio Code Copilot 扩展**

您已成为 GitHub Copilot 的用户，利用 AI 帮助您成为专业开发人员。 但在一些企业场景下，我们会面临不同的编码需求，比如企业的编码风格、企业的测试用例编写、企业的项目文档编写要求等。您可能会发现 GitHub Copilot 需要升级，或者您可以选择 GitHub Copilot 等待名单产品，并因漫长的等待而感到沮丧。 在本次研讨会中，我将告诉您如何使用 Azure OpenAI 服务结合 Semantic Kernel 和 Promptflow 为内部企业创建定制的 Visual Studio Code Copilot 扩展。

👀 此扩展不会取代 GitHub Copilot，而是在 GitHub Copilot 的基础上添加更多企业功能。

![image](/imgs/00/01.png)

从图中我们看到通用部分是使用 GitHub Copilot 完成的，而企业部分则需要通过本次workshop中提到的方法来完成。 以下是 Workshop 的几个步骤

**👣 1. Visual Studio Code 扩展开发**

您将学习如何自定义 Visual Studio Code 扩展以及如何为企业 Copilot 编程构建扩展原型


***⏲️ 时间***  60min

***😊 学习一下*** [阅读材料](./workshop/01/README.zh-cn.md)

***👁️‍🗨️ 看看代码*** [示例代码](./code/01)

**👣 2. 将 Semantic Kernel 添加到 Visual Studio Code 扩展**

Semantic Kernel 是 Copilot Stack 的最佳实践。 将 Semantic Kernel 注入到 Visual Studio Code 的扩展中？

***⏲️ 时间***  60min

***😊 学习一下*** [阅读材料](./workshop/02/README.zh-cn.md)

***👁️‍🗨️ 看看代码*** [示例代码](./code/02)


**👣 3. 将 Promptflow 添加到 Visual Studio Code 扩展**

通过 Promptflow 来管理企业级代码管理 Prompt 库的新知识。 利用 Semantic Kernel 的Planner 结合 Promptflow 创建更好的人机交互体验

***⏲️ 时间***  60min

***😊 学习一下*** [阅读材料](./workshop/03/README.zh-cn.md)

***👁️‍🗨️ 看看代码*** [示例代码](./code/03)

我们的架构是围绕 Copilot Stack 构建的

![image](/imgs/00/02.png)


## **🫵🫵 需要准备**

1. ⌛ Windows x86 / Arm 的设备 ( macOS / Linux 设备暂时不建议)
2. ⌛ 安装 NodeJS 18+ (https://nodejs.org/en/download)
3. ⌛ 安装 dotNET 8 (https://dotnet.microsoft.com/en-us/download)
4. ⌛ 安装 Python 3.10 (https://www.python.org/downloads/release/python-31012/) 
5. ⌛ Azure OpenAI Service / OpenAI Service (https://azure.microsoft.com/en-us/products/ai-services/openai-service)
6. ⌛ 安装 Docker (https://www.docker.com/)