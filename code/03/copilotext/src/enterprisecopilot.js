const vscode = require('vscode');
const fetch = require('node-fetch');
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


// const test_skill = SK.SkillDefinition.SKFunction.FromNativeFunction((name)=>demo(name));


// const test_skill = kernel.RegisterCustomFunction(SK.SkillDefinition.SKFunction.FromNativeFunction((name)=>demo(name)));


// function demo(str){
//     return "hello" + str;
// }
// const demo1 = kernel.RegisterSemanticFunction("demo", null);

async function RunPlanner(qa){

    const myUrl = 'http://192.168.50.231:8080/score';
    const myData = {"question":qa};
  
    const response = await fetch(myUrl, {
      method: 'POST',
      body: JSON.stringify(myData),
    }).then((response) => response.json());
  
    //console.log(response);

    return response.answer;


}



async function RunInSemanticKernel(code,style) {
    

    var docFunction = code_plugin.get(style);


   const context_variable = new dotnet.Microsoft.SemanticKernel.Orchestration.ContextVariables(code);

    

    SK.Orchestration.FunctionResult;

    const answer = await SK.SKFunctionExtensions.InvokeAsync(docFunction,kernel,context_variable);

    
    return answer.ToString();

}


module.exports = {
    RunInSemanticKernel,
    RunPlanner
}