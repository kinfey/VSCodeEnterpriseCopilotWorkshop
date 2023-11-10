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


async function RunInSemanticKernel(code,style) {

    var docFunction = code_plugin.get(style);


   const context_variable = new dotnet.Microsoft.SemanticKernel.Orchestration.ContextVariables(code);

    

    SK.Orchestration.FunctionResult;

    const answer = await SK.SKFunctionExtensions.InvokeAsync(docFunction,kernel,context_variable);

    
    return answer.toString();

}


module.exports = RunInSemanticKernel;