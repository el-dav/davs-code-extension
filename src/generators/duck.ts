'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';

const DUCKS_PATH = '/src/ducks/';

const ucfirst = word => word.charAt(0).toUpperCase() + word.slice(1);

const getActions = () =>
  `import { action } from 'typesafe-actions';

import constants from './constants';

export const actionName  = () => action(constants.ACTION_NAME);
`;

const getConstants = (name: string) => {
  const projectPath = workspace.workspaceFolders[0].uri.fsPath
    .split('\\')
    .join('/');
  const parts = projectPath.split('/');
  const projectName = parts[parts.length - 1];

  return `enum constants {
  ACTION_NAME = '${projectName}/${name}/ACTION_NAME'
}

export default constants;
`;
};

const getEpics = () =>
  `import { combineEpics } from 'redux-observable';
import { ignoreElements, filter } from 'rxjs/operators';
import { isOfType } from 'typesafe-actions';

import { AppEpic } from 'ducks';

import constants from './constants';

const initial: AppEpic = (action$, state$) =>
  action$.pipe(
    filter(isOfType(constants.ACTION_NAME)),
    ignoreElements()
  );

export default combineEpics(initial);
`;

const getReducers = (name: string) =>
  `import { ActionType } from 'typesafe-actions';

import * as actions from './actions';
import constants from './constants';

export type State = Readonly<{}>;
export type Action = ActionType<typeof actions>;

const initialState: State = {};

const ${name} = (state = initialState, action: Action): State => {
  switch (action.type) {
    case constants.ACTION_NAME:
      return { ...state };
    default:
      return state;
  }
};

export default ${name};
`;

const getSelectors = (name: string) =>
  `import { createSelector } from 'reselect';

import { AppState } from 'ducks';

const selectState = (state: AppState) => state.${name};

export const select${ucfirst(
    name
  )}State = createSelector([selectState], state => state);
`;

const getSpec = (name: string) =>
  `import { initialAppState, AppState } from 'ducks';

// import * as actions from './actions';
import * as selectors from './selectors';
import reducer, { State } from './reducers';

const state: State = {};
const appState: AppState = { ...initialAppState, ${name}: state };

describe('${name} reducer', () => {
  describe('actions', () => {
    it('should return the same state for random action', () => {
      const randomAction = {type: ''} as any;
      expect(reducer(state, randomAction)).toBe(state);
    });
  });

  describe('selectors', () => {
    it('should select${ucfirst(name)}State', () => {
      expect(selectors.select${ucfirst(name)}State(appState)).toBe(state);
    });
  });
});
`;

export const create = (name: string) => {
  const projectRoot = workspace.workspaceFolders[0].uri.fsPath;
  const path = `${projectRoot}${DUCKS_PATH}${name}/`.split('\\').join('/');

  const actionsPath = `${path}actions.ts`;
  const constantsPath = `${path}constants.ts`;
  const epicsPath = `${path}epics.ts`;
  const reducersPath = `${path}reducers.ts`;
  const selectorsPath = `${path}selectors.ts`;
  const specPath = `${path}${name}.spec.ts`;

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

    makeFileSync(specPath);
    writeFileSync(specPath, getSpec(name));

    return {
      message: 'Remember to add reference to duck and epic',
      files: [
        actionsPath,
        constantsPath,
        epicsPath,
        reducersPath,
        selectorsPath,
        specPath,
      ],
    };
  } catch (e) {
    window.showErrorMessage(e);
  }
};
