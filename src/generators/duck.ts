'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';

const DUCKS_PATH = '/src/ducks/';

const ucfirst = word => word.charAt(0).toUpperCase() + word.slice(1);

const getActions = () => (
`import { ACTION_NAME } from './constants';

export const actionName  = () => ({
  type: ACTION_NAME,
});
`
);

const getConstants = (name: string) => {
    const projectPath = workspace.workspaceFolders[0].uri.fsPath.split('\\').join('/');
    const parts = projectPath.split('/');
    const projectName = parts[parts.length];

    return `export const ACTION_NAME = '${projectName}/${name}/ACTION_NAME';
`
};

const getEpics = () => (
`import 'rxjs/add/operator/ignoreElements';
import { combineEpics } from 'redux-observable';

const initial = action$ => (
  action$.ignoreElements()
);

export default combineEpics(initial);
`
);

const getReducers = (name: string) => (
`import { ACTION_NAME } from './constants';

const initialState = {};

const ${name} = (state = initialState, action) => {
  switch (action.type) {
    case ACTION_NAME:
      return { ...state };
    default:
      return state;
  }
};

export default ${name};
`
);

const getSelectors = (name: string) => (
`// import { createSelector } from 'reselect';

export const select${ucfirst(name)}State = state => state.${name};
`
);

export const create = (name: string) => {
    const projectRoot = workspace.workspaceFolders[0].uri.fsPath;
    const path = `${projectRoot}${DUCKS_PATH}${name}/`.split('\\').join('/');

    const actionsPath = `${path}actions.tsx`;
    const constantsPath = `${path}constants.tsx`;
    const epicsPath = `${path}epics.tsx`;
    const reducersPath = `${path}reducers.tsx`;
    const selectorsPath = `${path}selectors.tsx`;


    try {
        makeFileSync(actionsPath);
        writeFileSync(
            actionsPath,
            getActions()
        );

        makeFileSync(constantsPath);
        writeFileSync(
            constantsPath,
            getConstants(name)
        );

        makeFileSync(epicsPath);
        writeFileSync(
            epicsPath,
            getEpics()
        );

        makeFileSync(reducersPath);
        writeFileSync(
            reducersPath,
            getReducers(name)
        );

        makeFileSync(selectorsPath);
        writeFileSync(
            selectorsPath,
            getSelectors(name)
        );

        return {
            message: 'Remember to add reference to duck and epic',
            files: [actionsPath, constantsPath, epicsPath, reducersPath, selectorsPath]
        };
    }
    catch (e) {
        window.showErrorMessage(e);
    }
}