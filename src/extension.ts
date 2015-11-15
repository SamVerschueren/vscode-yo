'use strict';

import {window, workspace, commands, ExtensionContext, QuickPickItem} from 'vscode';
import path = require('path');
import fs = require('fs');

import Yeoman from './yo/yo';

const yo = new Yeoman();

export function activate(context: ExtensionContext) {
	const cwd = workspace.rootPath;

	const disposable = commands.registerCommand('yo', () => {
		return window.showQuickPick(list())
			.then(generator => {
				if (generator !== undefined) {
					yo.run(generator.label, cwd);
				}
			});
	});

	context.subscriptions.push(disposable);
}

function list(): Promise<QuickPickItem[]> {
	return new Promise(resolve => {
		yo.getEnvironment().lookup(() => {
			resolve(yo.getGenerators().map(generator => {
				return {
					label: generator.name.split(/\-(.+)?/)[1],
					description: generator.description
				};
			}));
		});
	});
}
