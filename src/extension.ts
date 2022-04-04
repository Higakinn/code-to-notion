// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const { Client } = require("@notionhq/client");

const notion = new Client({
	auth: vscode.workspace.getConfiguration().get('code-to-notion.notionApiToken'),
});
const databaseId = vscode.workspace.getConfiguration().get('code-to-notion.databaseId');
if (typeof databaseId !== "string") {
	vscode.window.showErrorMessage('Please enter databaseId');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with 	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-to-notion.createInbox', async () => {
		// The code you place here will be executed every time your command is executed
		const input = await vscode.window.showInputBox({
			title: 'Please enter what you have',
			placeHolder: 'I study English!'
		});

		if (typeof input === undefined) {
			vscode.window.showErrorMessage('Please enter databaseId');
			return;
		}

		// Display a message box to the user
		const result = await createInbox(databaseId, input);
		vscode.window.showInformationMessage(`${result}`);

	});

	context.subscriptions.push(disposable);
}

async function createInbox(databaseId: any, content?: string) {
	let myPage;
	try {
		myPage = await notion.pages.create({
			parent: {
				database_id: databaseId,
			},
			properties: {
				'やりたいこと': {
					title: [
						{
							text: {
								content: content,
							},
						},
					],
				},
			}
		});
	} catch (error) {
		return error;
	}
	return JSON.stringify(myPage);
}

// this method is called when your extension is deactivated
export function deactivate() { }