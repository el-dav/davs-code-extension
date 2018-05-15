'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';

const DUCKS_PATH = '/src/ducks/';

const ucfirst = word => word.charAt(0).toUpperCase() + word.slice(1);

const getActions = () =>
  `import { ACTION_NAME } from './constants';

export const actionName  = () => ({
  type: ACTION_NAME,
});

export type Action = ReturnType<typeof actionName>
`;

const getConstants = (name: string) => {
  const projectPath = workspace.workspaceFolders[0].uri.fsPath
    .split('\\')
    .join('/');
  const parts = projectPath.split('/');
  const projectName = parts[parts.length - 1];

  return `export const ACTION_NAME = '${projectName}/${name}/ACTION_NAME';
`;
};

const getEpics = () =>
  `import { /* ofType, */ combineEpics } from 'redux-observable';
import { ignoreElements } from 'rxjs/operators/ignoreElements';

const initial = action$ =>
  action$.pipe(
    ignoreElements()
  );

export default combineEpics(initial);
`;

const getReducers = (name: string) =>
  `import { Action } from './actions';
import { ACTION_NAME } from './constants';

export type State = Readonly<{
     
}>

const initialState: State = {};

const ${name} = (state = initialState, action: Action): State => {
  switch (action.type) {
    case ACTION_NAME:
      return { ...state };
    default:
      return state;
  }
};

export default ${name};
`;

const getSelectors = (name: string) =>
  `import { createSelector } from 'reselect';

import { State } from './reducers';

const selectState = (state): State => state.${name};

export const select${ucfirst(
    name
  )}State = createSelector([selectState], state => state);
`;

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
    writeFileSync(actionsPath, getActions());

    makeFileSync(constantsPath);
    writeFileSync(constantsPath, getConstants(name));

    makeFileSync(epicsPath);
    writeFileSync(epicsPath, getEpics());

    makeFileSync(reducersPath);
    writeFileSync(reducersPath, getReducers(name));

    makeFileSync(selectorsPath);
    writeFileSync(selectorsPath, getSelectors(name));

    return {
      message: 'Remember to add reference to duck and epic',
      files: [
        actionsPath,
        constantsPath,
        epicsPath,
        reducersPath,
        selectorsPath,
      ],
    };
  } catch (e) {
    window.showErrorMessage(e);
  }
};
