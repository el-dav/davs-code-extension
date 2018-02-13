'use strict';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import * as path from 'path';

export const makeDirSync = (dir: string) => {
    if (existsSync(dir)) return;
    if (!existsSync(path.dirname(dir))) {
        makeDirSync(path.dirname(dir));
    }
    mkdirSync(dir);
}

export const makeFileSync = (filename: string) => {
    if (!existsSync(filename)) {
        makeDirSync(path.dirname(filename));
        createWriteStream(filename).close();
    }
}