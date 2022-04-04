"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const { Client } = require("@notionhq/client");
const notion = new Client({
    auth: vscode.workspace.getConfiguration().get('code-block-to-notion.notionToken'),
});
const databaseId = vscode.workspace.getConfiguration().get('code-block-to-notion.databaseId');
const titleTaskName = vscode.workspace.getConfiguration().get('code-block-to-notion.titleTaskName');
const titleTaskDate = vscode.workspace.getConfiguration().get('code-block-to-notion.titleTaskDate');
const pageTitle = vscode.workspace.getConfiguration().get('code-block-to-notion.pageTitle');
const openByApp = vscode.workspace.getConfiguration().get('code-block-to-notion.openByApp');
const FILETYPES = {
    "ts": "typescript",
    "tsx": "typescript",
    "js": "javascript",
    "py": "python",
    "html": "html",
    "haml": "haml",
    "rb": "ruby",
    "css": "css",
    "tex": "LaTeX",
    "sty": "LaTeX",
    "m": "MATLAB",
    "rs": "Rust",
    "swift": "Swift",
    "yml": "YAML",
    "sh": "Shell",
    "c": "C",
    "h": "C"
};
const appendCodeBlock = (pageId, code, language) => __awaiter(void 0, void 0, void 0, function* () {
    if (pageId === '') {
        vscode.window.showErrorMessage('Pleage create today page');
        return;
    }
    if (code === '') {
        vscode.window.showErrorMessage('Please enter some code');
        return;
    }
    if (language === '') {
        vscode.window.showErrorMessage('Please enter a language');
        return;
    }
    const response = yield notion.blocks.children.append({
        block_id: pageId,
        children: [
            {
                "type": "code",
                "object": "block",
                "code": {
                    "text": [{
                            "type": "text",
                            "text": {
                                "content": code
                            }
                        }],
                    "language": language
                }
            }
        ],
    });
    return response;
});
function getTodayPage() {
    return __awaiter(this, void 0, void 0, function* () {
        let myPage;
        try {
            var d = new Date();
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            const lists = yield notion.databases.query({
                database_id: databaseId,
                filter: {
                    and: [
                        {
                            property: titleTaskName,
                            text: {
                                starts_with: pageTitle,
                            },
                        },
                        {
                            property: titleTaskDate,
                            date: {
                                after: d.toISOString(),
                            },
                        },
                    ],
                },
            });
            myPage = lists.results[0];
        }
        catch (error) {
            return undefined;
        }
        return myPage;
    });
}
const logic = (editor) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let codeBlock = editor === null || editor === void 0 ? void 0 : editor.document.getText(editor.selection);
        const filename = editor === null || editor === void 0 ? void 0 : editor.document.fileName.split('.');
        const fileType = filename === null || filename === void 0 ? void 0 : filename.slice(-1)[0];
        if (codeBlock === undefined) {
            vscode.window.showErrorMessage('Plaease select some code');
            return;
        }
        if (fileType === undefined) {
            vscode.window.showErrorMessage('Please select a file');
            return;
        }
        const language = FILETYPES[fileType];
        if (language === undefined) {
            vscode.window.showErrorMessage('Please select a valid file');
            return;
        }
        const myPage = yield getTodayPage();
        if (myPage === undefined) {
            return;
        }
        const pageId = myPage.id;
        yield appendCodeBlock(pageId, codeBlock, language);
        return myPage.url;
    }
    catch (err) {
        console.error(err);
        return null;
    }
});
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "code-block-to-notion" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('code-block-to-notion.toNotion', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        const url = yield logic(editor);
        if (url) {
            vscode.window.showInformationMessage(`Append code block successfully`, 'open page').then((value) => __awaiter(this, void 0, void 0, function* () {
                if (value === 'open page') {
                    if (openByApp) {
                        vscode.env.openExternal(vscode.Uri.parse(url.replace('https', 'notion')));
                    }
                    else {
                        vscode.env.openExternal(vscode.Uri.parse(url));
                    }
                }
            }));
        }
        else {
            vscode.window.showErrorMessage('Could not create page -- check dev console');
        }
    }));
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
