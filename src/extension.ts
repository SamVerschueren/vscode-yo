'use strict';

import {window, workspace, commands, ExtensionContext} from 'vscode';
import path = require('path');
import fs = require('fs');

import Yeoman from './yo/yo';

const yo = new Yeoman();

export function activate(context: ExtensionContext) {
	const cwd = workspace.rootPath;

	const disposable = commands.registerCommand('yo', () => {
		list()
			.then(generators => {
				return window.showQuickPick(generators.map(generator => {
					return {
						label: generator.name.split(/\-(.+)?/)[1],
						description: generator.description
					};
				}));
			})
			.then(generator => {
				yo.run(generator.label, cwd);
			})
			.catch(err => {
				console.error(err);
			});
	});

	context.subscriptions.push(disposable);
}

function list(): Promise<any[]> {
	return new Promise(resolve => {
		yo.getEnvironment().lookup(() => {
			resolve(yo.getGenerators());
		});
	});
}
