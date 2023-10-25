const vscode = require('vscode');
const path = require('node:path');
const dotnet = require('node-api-dotnet');
require('./semantic-kernel.js');




const SK = dotnet.Microsoft.SemanticKernel;
const config = vscode.workspace.getConfiguration('copilotext');
const endPoint = config.get('endpoint');
const apiKey = config.get('api_key');
const gptModel = config.get('chatgptmodel');
const kernel = SK.OpenAIKernelBuilderExtensions.WithAzureChatCompletionService(SK.Kernel.Builder, gptModel,endPoint, apiKey).Build();
const skillsDirectory = path.join(__dirname,'../plugins');
const skills = ['CodePlugin'];

const code_skill = SK.KernelSemanticFunctionExtensions.ImportSemanticFunctionsFromDirectory(kernel,skillsDirectory,skills);

async function RunInSemanticKernel(code,style) {

    var docFunction = code_skill.get(style);


   const context_variable = new dotnet.Microsoft.SemanticKernel.Orchestration.ContextVariables(code);

    

    SK.Orchestration.FunctionResult;

    const answer = await SK.SKFunctionExtensions.InvokeAsync(docFunction,kernel,context_variable);

    
    return answer.toString();

}


module.exports = RunInSemanticKernel;