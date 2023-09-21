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
const kernel = SK.OpenAIKernelBuilderExtensions.WithAzureChatCompletionService(SK.Kernel.Builder, gptModel,endPoint, apiKey).Build();
const skillsDirectory = path.join(__dirname,'../skills');
const skills = ['CodeSkill'];
const code_skill = SK.ImportSemanticSkillFromDirectoryExtension.ImportSemanticSkillFromDirectory(kernel,skillsDirectory,skills);



// const test_skill = SK.SkillDefinition.SKFunction.FromNativeFunction((name)=>demo(name));


// const test_skill = kernel.RegisterCustomFunction(SK.SkillDefinition.SKFunction.FromNativeFunction((name)=>demo(name)));


// function demo(str){
//     return "hello" + str;
// }
// const demo1 = kernel.RegisterSemanticFunction("demo", null);

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



async function RunInSemanticKernel(code,style) {
    
    const docFunction = code_skill.get(style);
    
    const context_variable = new SK.Orchestration.ContextVariables(code);

    const context = new SK.Orchestration.SKContext(context_variable);

    const answer = await docFunction.InvokeAsync(context);

    
    return answer.ToString();

}


module.exports = {
    RunInSemanticKernel,
    RunPlanner
}