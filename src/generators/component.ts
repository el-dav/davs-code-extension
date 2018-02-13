'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';

const getTyp = () => (
`export interface OwnProps {
  className?: string;
}

export interface StateProps {
  className?: string;
}

export interface DispatchProps {}

export interface Props extends StateProps, DispatchProps {}
`
);

const getCnt = (name: string) => (
`import { connect } from 'react-redux';

import ${name} from './${name}.cmp';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './${name}.typ';

const mapStateToProps = (state, ownProps: OwnProps): StateProps => ({
  className: ownProps.className
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(${name});
`
);

const getCmp = (name: string) => (
`import React from 'react';

import { Props } from './${name}.typ';

const ${name} = ({ className }: Props) => (
  <div className={className || ''} />
);

export default ${name};
`
);

export const create = (name: string, path: string) => {
    const projectRoot = workspace.workspaceFolders[0].uri.fsPath;
    const componentPath = `${projectRoot}${path}${name}/${name}`.split('\\').join('/');
    
    const typPath = `${componentPath}.typ.tsx`;
    const cntPath = `${componentPath}.cnt.tsx`;
    const cmpPath = `${componentPath}.cmp.tsx`;

    try {
        makeFileSync(typPath);
        writeFileSync(
            typPath,
            getTyp()
        );

        makeFileSync(cntPath);
        writeFileSync(
            cntPath,
            getCnt(name)
        );

        makeFileSync(cmpPath);
        writeFileSync(
            cmpPath,
            getCmp(name)
        );

        return {
            files: [typPath, cntPath, cmpPath]
        };
    }
    catch (e) {
        window.showErrorMessage(e);
    }
}