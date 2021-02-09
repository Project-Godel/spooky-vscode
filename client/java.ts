import * as path from 'path';
import * as which from 'which';
import * as child_process from 'child_process';
import { workspace } from 'vscode';

let javaPath: string | null = null;

function javaBinary(homePath: string | undefined): string | null {
    if (!homePath) {
        return null;
    }
    return path.join(homePath, "bin", "java");
}

async function validJava(binaryPath: string | null): Promise<boolean> {
    if (!binaryPath) {
        return false;
    }
    return new Promise((resolve, reject) => {
        child_process.execFile(binaryPath, ["-version"],  (error, stdout, stderr) => {
            const regexp = /version "(.*)"/g;
            const match = regexp.exec(stderr);
            if (!match) {
                resolve(false);
                return;
            }
            const versionStr = match[1];
            console.log("Java at", binaryPath, "has version", versionStr);
            const versionMatch = /\d+/g.exec(versionStr);
            if (versionMatch) {
                resolve(parseInt(versionMatch[0]) >= 14);
            }
            resolve(false);
        });
    });
}

export async function getJavaPath(): Promise<string | null> {
    if (javaPath) {
        return javaPath;
    }
    // Check the java.home workspace config; 
    const setting = javaBinary(workspace.getConfiguration().inspect<string>('java.home')?.workspaceValue);
    if (await validJava(setting)) {
        return setting;
    }
    const jdkHome = javaBinary(process.env["JDK_HOME"]);
    if (await validJava(jdkHome)) {
        return javaPath = jdkHome;
    }
    const javaHome = javaBinary(process.env["JAVA_HOME"]);
    if (await validJava(javaHome)) {
        return javaPath = javaHome;
    }
    const onPath = which.sync('java', {nothrow: true});
    if (await validJava(onPath)) {
        return javaPath = onPath;
    }
    return null;
}
