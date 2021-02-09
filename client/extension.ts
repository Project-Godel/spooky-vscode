import { LanguageClient } from 'vscode-languageclient/node';
import { ExtensionContext, window, commands, Uri } from 'vscode';

import { getJavaPath } from './java';
import { getSpookyPath, compile } from './spooky';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
    console.log("Activating Spooky...");
    const javaPath = await getJavaPath();
    console.log("Using Java", javaPath);
    if (!javaPath) {
		    window.showErrorMessage("Spooky requires Java 14 or later, but no runtime was found.");
        return;
    }
    context.subscriptions.push(commands.registerCommand("spooky.compile", (fileUri: Uri) => {
        compile(fileUri.path);
    }));
    return {
      "getSpookyPath": () => getSpookyPath,
      "getJavaPath": () => getJavaPath,
    };
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
