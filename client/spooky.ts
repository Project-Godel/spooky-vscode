import * as path from 'path';
import { window, extensions, commands } from 'vscode';
import * as shellescape from 'shell-escape';
import { getJavaPath } from './java';

const extDir = extensions.getExtension ("jsannemo.spooky")?.extensionPath;

export async function compile(sourcePath: string) {
    const spookyPath = getSpookyPath();
    if (!spookyPath) {
        window.showErrorMessage("Could not determine path of the bundled Spooky compiler.");
        return;
    }
    const javaPath = await getJavaPath();
    if (!javaPath) {
        window.showErrorMessage("Spooky requires Java 14 or later, but no runtime was found.");
        return;
    }
    const pathComponents = sourcePath.split(".");
    pathComponents.pop();
    pathComponents.push("spook");
    const outPath = pathComponents.join('.');
    commands.executeCommand("workbench.action.terminal.toggleTerminal").then(() => 
        window.activeTerminal?.sendText(shellescape([javaPath, "--enable-preview", "-jar", spookyPath ,"compile", sourcePath, outPath])));
    return outPath;
}

export function getSpookyPath(): string | null {
    if (!extDir) {
        return null;
    }
    return path.join(extDir, "spooky.jar");
}