# **Add Semantic Kernel to Visual Studio Code Extension**

## **Introduction Semantic Kernel**

At Microsoft Build in May 2023, Microsoft released Copilot Stack for LLM applications. It pointed out the direction for everyone to build applications through large models. Semantic Kernel is the best framework to implement Copilot Stack (this is a bit one-sided, but I am undeniably a Semantic Kernel fanatic). Someone asked me, why not LangChain? It is undeniable that LangChain is a good framework. It solves AI problems more in an AI way, but Semantic Kernel better bridges the gap between code and prompts, and is very good for highly engineered projects. role. If you want to learn more about Semantic Kernel, you can go to Semantic Kernel’s GitHub to learn.

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
    <TargetFramework>net7.0</TargetFramework>
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

1. It is recommended to install .NET 6, .NET 7, and .NET 8 RC 1
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

function resolveAssembly(name) {
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

4. Create a new skills folder in the copilotext directory, add the docsskill folder in the skill directory, and then add the translate folder in the docsskill directory.

5. Add skprompt.txt and config.json in the translate directory

6. Add enterprise-copilot.js in src folder

7. Update extension.js & web.js  file

8. 

