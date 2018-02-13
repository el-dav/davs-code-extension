'use strict';

import { workspace, window } from 'vscode';

import { makeFileSync } from '../createFile';

const SERVICES_PATH = '/src/services/';

export const create = (name: string) => {
    const projectRoot = workspace.workspaceFolders[0].uri.fsPath;
    const path = `${projectRoot}${SERVICES_PATH}${name}/`.split('\\').join('/');

    const actionsPath = `${path}index.tsx`;

    try {
        makeFileSync(actionsPath);

        return {
            files: [actionsPath]
        };
    }
    catch (e) {
        window.showErrorMessage(e);
    }
}