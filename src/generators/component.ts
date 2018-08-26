'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';

const getTyp = () =>
  `export interface OwnProps {
  className?: string;
}

export interface StateProps {
  className?: string;
}

export interface DispatchProps {}

export interface Props extends StateProps, DispatchProps {}
`;

const getCnt = (name: string) =>
  `import { connect } from 'react-redux';

import { AppState, AppDispatch } from 'ducks';

import ${name} from './${name}.cmp';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './${name}.typ';

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => ({
  className: ownProps.className
});

const mapDispatchToProps = (dispatch: AppDispatch): DispatchProps  => ({});

export default connect(mapStateToProps, mapDispatchToProps)(${name});
`;

const getCmp = (name: string) =>
  `import React from 'react';

import { Props } from './${name}.typ';

const ${name}: React.SFC<Props> = ({ className }) => (
  <div className={className || ''} />
);

export default ${name};
`;

const getSpec = (name: string) =>
  `import React from 'react';
import renderer from 'react-test-renderer';

import Story from 'assets/Story';

import ${name}Cmp from './${name}.cmp';
import ${name}Cnt from './${name}.cnt';

describe('${name}', () => {
  it('renders the Component correctly', () => {
    const tree = renderer
      .create(
        <Story isConnected>
          <${name}Cmp />
        </Story>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders the Container correctly', () => {
    const tree = renderer
      .create(
        <Story isConnected>
          <${name}Cnt />
        </Story>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
`;

const getStorybook = (name: string) =>
  `import React from 'react';
import { storiesOf } from '@storybook/react';

import Story from 'assets/Story';

import ${name} from './${name}.cmp';
import Connected${name} from './${name}.cnt';

const stories = storiesOf('${name}', module);

stories.add('Default', () => (
  <Story>
    <${name} />
  </Story>
));

stories.add('Connected', () => (
  <Story isConnected>
    <Connected${name} />
  </Story>
));

export default stories;
`;

const getIndex = (name: string) =>
  `import ${name} from './${name}.cnt';
export default ${name};
`;

export const create = (name: string, path: string) => {
  const projectRoot = workspace.workspaceFolders[0].uri.fsPath;
  const componentPath = `${projectRoot}${path}${name}/`.split('\\').join('/');

  const typPath = `${componentPath}${name}.typ.ts`;
  const cntPath = `${componentPath}${name}.cnt.ts`;
  const cmpPath = `${componentPath}${name}.cmp.tsx`;
  const specPath = `${componentPath}${name}.spec.tsx`;
  const storyPath = `${componentPath}${name}.stories.tsx`;
  const indexPath = `${componentPath}index.tsx`;

  try {
    makeFileSync(typPath);
    writeFileSync(typPath, getTyp());

    makeFileSync(cntPath);
    writeFileSync(cntPath, getCnt(name));

    makeFileSync(cmpPath);
    writeFileSync(cmpPath, getCmp(name));

    makeFileSync(specPath);
    writeFileSync(specPath, getSpec(name));

    makeFileSync(storyPath);
    writeFileSync(storyPath, getStorybook(name));

    makeFileSync(indexPath);
    writeFileSync(indexPath, getIndex(name));

    return {
      files: [typPath, cntPath, cmpPath, specPath, storyPath, indexPath],
    };
  } catch (e) {
    window.showErrorMessage(e);
  }
};
