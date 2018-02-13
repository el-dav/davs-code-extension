'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';
import { create as createComponent} from './component';

const ASSET_PATH = '\\src\\assets\\'

export const create = (name: string) => {
    const fileData = createComponent(name, ASSET_PATH);
    return fileData;
}