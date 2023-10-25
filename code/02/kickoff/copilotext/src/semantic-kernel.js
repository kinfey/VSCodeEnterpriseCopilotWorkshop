
const fs = require('node:fs');
const path = require('node:path');
const dotnet = require('node-api-dotnet');

const skAssemblyName = 'Microsoft.SemanticKernel.Core';
const skOpenAIAssemblyName = 'Microsoft.SemanticKernel.Connectors.AI.OpenAI';
// const skFunc = 'CustomSKFunc';

/** All assemblies are resolved from the bin directory, where they were copied by MSBuild. */
function resolveAssembly(name) {
  console.log(path.join('../bin', name + '.dll'));
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