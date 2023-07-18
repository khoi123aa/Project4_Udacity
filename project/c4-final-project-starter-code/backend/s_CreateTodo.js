
var serverlessSDK = require('./serverless_sdk/index.js');
serverlessSDK = new serverlessSDK({
  orgId: 'khoitha',
  applicationName: 'serverless-todo-app',
  appUid: 'rd24RGY4KWm4fyz4fZ',
  orgUid: '330a22fe-4e79-4fa8-8289-5620420f2afb',
  deploymentUid: '5b0513e6-3779-4fc2-a420-46c664e64f0b',
  serviceName: 'serverless-todo-app',
  shouldLogMeta: true,
  shouldCompressLogs: true,
  disableAwsSpans: false,
  disableHttpSpans: false,
  stageName: 'dev',
  serverlessPlatformStage: 'prod',
  devModeEnabled: false,
  accessKey: null,
  pluginVersion: '5.5.1',
  disableFrameworksInstrumentation: false
});

const handlerWrapperArgs = { functionName: 'serverless-todo-app-dev-CreateTodo', timeout: 6 };

try {
  const userHandler = require('./src/lambda/http/createTodo.js');
  module.exports.handler = serverlessSDK.handler(userHandler.handler, handlerWrapperArgs);
} catch (error) {
  module.exports.handler = serverlessSDK.handler(() => { throw error }, handlerWrapperArgs);
}