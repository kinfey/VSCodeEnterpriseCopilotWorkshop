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

