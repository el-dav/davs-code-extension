'use strict';

import { workspace, window } from 'vscode';
import { writeFileSync } from 'fs';

import { makeFileSync } from '../createFile';


const REPORTS_PATH = '/src/services/agGrid/reports/';

const getIndex = () => (
`import { getColumns } from './columns';
import { applyLayout } from './layouts';

export const getColumnDefs = (layout: string) => (
  layout ?
  applyLayout(
    layout,
    getColumns()
  ) :
  getColumns()
)
`
);

const getLayouts = () => (
`import _orderBy from 'lodash/orderBy';

import { <DEFAULT_LAYOUT> } from 'constants/layouts';

const applyDefaultLayout = (columns) => {
  const layoutColumns = columns.map((column) => {
    const layoutColumn = { ...column };
    layoutColumn.orderBy = 0;

    switch (layoutColumn.field) {
      case '<columnField>':
        break;
      default:
        layoutColumn.hide = true;
        break;
    }

    return layoutColumn;
  })

  return _orderBy(layoutColumns, 'orderBy');
}

export const applyLayout = (layout, columns) => {
  switch (layout) {
    case <DEFAULT_LAYOUT>.id: {
      return applyDefaultLayout(columns);
    }
    default: {
      return columns;
    }
  }
};
`
);

const getColumns = () => (
`import {
  <COLUMN_NAME>,
} from 'services/agGrid/columns/columns';

const columns = [
  <COLUMN_NAME>,
];

export const getColumns = () => columns;
`
);

export const create = (name: string) => {
    const projectRoot = workspace.workspaceFolders[0].uri.fsPath;
    const path = `${projectRoot}${REPORTS_PATH}${name}/`.split('\\').join('/');

    const indexPath = `${path}index.tsx`;
    const columnsPath = `${path}columns.tsx`;
    const layoutsPath = `${path}layouts.tsx`;

    try {
        makeFileSync(indexPath);
        writeFileSync(
            indexPath,
            getIndex()
        );

        makeFileSync(columnsPath);
        writeFileSync(
            columnsPath,
            getColumns()
        );

        makeFileSync(layoutsPath);
        writeFileSync(
            layoutsPath,
            getLayouts()
        );

        return {
          message: 'Remember to report and layout constants too application',
          files: [indexPath, columnsPath, layoutsPath]
        };
    }
    catch (e) {
        window.showErrorMessage(e);
    }
}