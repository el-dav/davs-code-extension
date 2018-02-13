'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';
import { create as createComponent } from './component';

const VIEW_PATH = '\\src\\views\\'

export const create = (name: string) => {
    return createComponent(name, VIEW_PATH);
}