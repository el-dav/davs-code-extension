'use strict';
import { window, commands, ExtensionContext, workspace } from 'vscode';

import { lstatSync } from 'fs';

import { ASSET, COMPONENT, DUCK, SERVICE, VIEW } from './createTypes';

import { create as createAsset } from './generators/asset';
import { create as createCompoenent } from './generators/component';
import { create as createDuck } from './generators/duck';
import { create as createService } from './generators/service';
import { create as createView } from './generators/view';

interface Thing {
  type: string;
  name: string;
  path?: string;
}

const justLetter = '^([a-zA-Z])+$';
const lowerCamelCase = '^([a-z]+)([A-Z]?[a-z]+)+$';
const upperCamelCase = '^([A-Z]+)([A-Z]?[a-z]+)+$';
const isUpperCamel = thing =>
  thing === ASSET || thing === VIEW || thing === COMPONENT;

const validThingName = ({ type, name }) => {
  const upperCamel = isUpperCamel(type);
  const letterRegEx = new RegExp(justLetter);
  const caseRegEx = new RegExp(upperCamel ? upperCamelCase : lowerCamelCase);
  if (!letterRegEx.test(name)) {
    return {
      valid: false,
      message: 'Letters Only',
    };
  }
  if (!caseRegEx.test(name)) {
    return {
      valid: false,
      message: `Should be ${upperCamel ? 'UpperCamelCase' : 'lowerCamelCase'}`,
    };
  }
  return { valid: true };
};

const getTypeOfThing = () => {
  const createOptions = [ASSET, DUCK, SERVICE, VIEW];
  return window.showQuickPick(createOptions).then(type => type);
};

const getNameOfThing: (
  type: string,
  path?: string
) => Thenable<Thing | undefined> = (type: string, path?: string) => {
  if (type) {
    return window
      .showInputBox({
        prompt: `${type} name?`,
        validateInput: name => {
          const isValid = validThingName({ type, name });
          return isValid.valid ? '' : isValid.message;
        },
      })
      .then(name => ({ type, name, path }));
  }
  return Promise.resolve(undefined);
};

const validateThing = (thing: Thing) => {
  const isValid = validThingName(thing);
  if (!isValid.valid) {
    window.showErrorMessage(isValid.message);
    return Promise.resolve(undefined);
  } else {
    return Promise.resolve(thing);
  }
};

const createThing = (thing: Thing) => {
  let fileData;

  switch (thing.type) {
    case ASSET: {
      fileData = createAsset(thing.name);
      break;
    }
    case COMPONENT: {
      fileData = createCompoenent(thing.name, thing.path);
      break;
    }
    case DUCK: {
      fileData = createDuck(thing.name);
      break;
    }
    case SERVICE: {
      fileData = createService(thing.name);
      break;
    }
    case VIEW: {
      fileData = createView(thing.name);
      break;
    }
    default: {
      fileData = undefined;
      break;
    }
  }

  return Promise.resolve(fileData);
};

const openGeneratedFiles = fileData => {
  fileData.files.forEach(file => {
    workspace.openTextDocument(file).then(editor => {
      window.showTextDocument(editor, { preview: false });
    });
  });

  return fileData.message;
};

const showMessage = (message?: string) => {
  if (message) {
    window.showInformationMessage(message);
  }
};

export function activate(context: ExtensionContext) {
  const generate = commands.registerCommand('extension.generate', () => {
    getTypeOfThing()
      .then(getNameOfThing)
      .then(validateThing)
      .then(createThing)
      .then(openGeneratedFiles)
      .then(showMessage);
  });

  const generateComponent = commands.registerCommand(
    'extension.generateComponent',
    context => {
      if (context && context.fsPath) {
        const projectRoot = workspace.workspaceFolders[0].uri.fsPath
          .split('\\')
          .join('/');
        const path = `${context.fsPath}/`
          .split('\\')
          .join('/')
          .replace(projectRoot, '');

        getNameOfThing(COMPONENT, path)
          .then(validateThing)
          .then(createThing)
          .then(openGeneratedFiles)
          .then(showMessage);
      }
    }
  );

  context.subscriptions.push(generate);
}

export function deactivate() {}
