# custom-copilot

Custom copilot for autocomplete functionality in your code with custom llm endpoints.

- [custom-copilot](#custom-copilot)
  - [Features](#features)
  - [Requirements](#requirements)
    - [Setting up Python Flask webserver for hosting API](#setting-up-python-flask-webserver-for-hosting-api)
  - [Extension Settings](#extension-settings)
  - [Extension File Structure](#extension-file-structure)
  - [Get up and running straight away](#get-up-and-running-straight-away)
  - [Make changes](#make-changes)
  - [Run tests](#run-tests)
  - [Extension guidelines](#extension-guidelines)

## Features

-  Code Completion
-  Chat with LLM after sending files

<!-- \!\[feature X\]\(images/feature-x.png\) -->

<!-- > Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow. -->

## Requirements

Instructions for setting up the developer workspace available at <https://code.visualstudio.com/api/get-started/your-first-extension>.

### Setting up Python Flask webserver for hosting API

Instructions at [Flask webserver readme](flask_server/README.md)

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `autocompleteModel`: LLM_MODEL_NAME,
* `uploadAPIURL`: UPLOAD_API_ENDPOINT,
* `autocompleteAPIURL`: AUTOCOMPLETE_API_ENDPOINT,
* `autocompleteDelay`: AUTOCOMPLETE_DELAY, // in milliseconds
* `autocompleteInputPromptSize`: AUTOCOMPLETE_MAX_INPUT_PROMPT_SIZE, // doubled when using fill_in_middle models
* `autocompleteInputMaxNewTokens`: AUTOCOMPLETE_MAX_OUTPUT_TOKEN_SIZE

## Extension File Structure

* `package.json` - Extension manifest file declaring extension and command.
  * The sample plugin registers a command and defines its title and command name. With this information VS Code can show the command in the command palette. It doesn’t yet need to load the plugin.
* `src/extension.ts` - Extension source code. 
  * The file exports one function, `activate`, which is called the very first time your extension is activated (in this case by executing the command). Inside the `activate` function we call `registerCommand`.
  * We pass the function containing the implementation of the command as the second parameter to `registerCommand`.
* `.vscode/launch.json` - Config for launching and debugging the vscode extension
* `.vscode/tasks.json` - COnfig for build task that compiles TypeScript 

## Get up and running straight away

* Press `F5` to open a new window with your extension loaded.
* Run your command from the command palette by pressing (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and typing `Hello World`.
* Set breakpoints in your code inside `src/extension.ts` to debug your extension.
* Find output from your extension in the debug console.

## Make changes

* You can relaunch the extension from the debug toolbar after changing code in `src/extension.ts`.
* You can also reload (`Ctrl+R` or `Cmd+R` on Mac) the VS Code window with your extension to load your changes.

## Run tests

* Install the [Extension Test Runner](https://marketplace.visualstudio.com/items?itemName=ms-vscode.extension-test-runner)
* Run the "watch" task via the **Tasks: Run Task** command. Make sure this is running, or tests might not be discovered.
* Open the Testing view from the activity bar and click the Run Test" button, or use the hotkey `Ctrl/Cmd + ; A`
* See the output of the test result in the Test Results view.
* Make changes to `src/test/extension.test.ts` or create new test files inside the `test` folder.
  * The provided test runner will only consider files matching the name pattern `**.test.ts`.
  * You can create folders inside the `test` folder to structure your tests any way you want.

## Extension guidelines

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
* [Extension UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview)
* [Extension Anatomy](https://code.visualstudio.com/api/get-started/extension-anatomy)
* [Extension Manifest package.json](https://code.visualstudio.com/api/references/extension-manifest)
* Reduce the extension size and improve the startup time by [bundling your extension](https://code.visualstudio.com/api/working-with-extensions/bundling-extension).
* [Publishing extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) on the VS Code extension marketplace.
* [Automated builds & Continuous Integration](https://code.visualstudio.com/api/working-with-extensions/continuous-integration).
* Full set of the vscode API in `node_modules/@types/vscode/index.d.ts`.
