# **🛠️ 建立適用於企業的 Visual Studio Code Copilot 擴充**

您已成為 GitHub Copilot 的使用者，利用 AI 幫助您成為專業開發人員。 但在一些企業場景下，我們會面臨不同的編碼需求，比如企業的編碼風格、企業的測試使用案例編寫、企業的專案文件編寫要求等。您可能會發現 GitHub Copilot 需要升級，或者您可以選擇 GitHub Copilot 等待名單產品，並因漫長的等待而感到沮喪。 在本次研討會中，我將告訴您如何使用 Azure OpenAI 服務結合 Semantic Kernel 和 Promptflow 為內部企業建立客製的 Visual Studio Code Copilot 擴充。

👀 此擴充不會取代 GitHub Copilot，而是在 GitHub Copilot 的基礎上新增更多企業功能。

![image](/imgs/00/01.png)

從圖中我們看到通用部分是使用 GitHub Copilot 完成的，而企業部分則需要透過本次workshop中提到的方法來完成。 以下是 Workshop 的幾個步驟

**👣 1. Visual Studio Code 擴充開發**

您將學習如何自訂 Visual Studio Code 擴充以及如何為企業 Copilot 程式設計建構擴充原型


***⏲️ 時間***  60min

***😊 學習一下*** [閱讀內容](./workshop/01/README.zh-cn.md)

***👁️‍🗨️ 看看程式碼*** [範例程式碼](./code/01)

**👣 2. 將 Semantic Kernel 新增到 Visual Studio Code 擴充**

Semantic Kernel 是 Copilot Stack 的最佳實踐。 將 Semantic Kernel 注入到 Visual Studio Code 的擴充中？

***⏲️ 時間***  60min

***😊 學習一下*** [閱讀內容](./workshop/02/README.zh-cn.md)

***👁️‍🗨️ 看看程式碼*** [範例程式碼](./code/02)


**👣 3. 將 Promptflow 新增到 Visual Studio Code 擴充**

透過 Promptflow 來管理企業級程式碼管理 Prompt 庫的新知識。 利用 Semantic Kernel 的Planner 結合 Promptflow 建立更好的人機互動體驗

***⏲️ 時間***  60min

***😊 學習一下*** [閱讀內容](./workshop/03/README.zh-cn.md)

***👁️‍🗨️ 看看程式碼*** [範例程式碼](./code/03)

我們的架構是圍繞 Copilot Stack 建構的

![image](/imgs/00/02.png)


## **🫵🫵 需要準備**

1. ⌛ Windows x86 / Arm 的裝置 ( macOS / Linux 裝置暫時不建議)
2. ⌛ 安裝 NodeJS 18+ (https://nodejs.org/en/download)
3. ⌛ 安裝 dotNET 8 (https://dotnet.microsoft.com/en-us/download)
4. ⌛ 安裝 Python 3.10 (https://www.python.org/downloads/release/python-31012/)
5. ⌛ Azure OpenAI Service / OpenAI Service (https://azure.microsoft.com/en-us/products/ai-services/openai-service)
6. ⌛ 安裝 Docker (https://www.docker.com/)
