// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {window, commands} from 'vscode';
import path = require('path');
import fs = require('fs');

import Yeoman from './yo/yo';

const yo = new Yeoman();

export function activate() {
	commands.registerCommand('yo', () => {
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
				yo.run(generator.label);
			})
			.catch(err => {
				console.error(err);
			});
	});
}

function list(): Promise<any[]> {
	return new Promise(resolve => {
		yo.getEnvironment().lookup(() => {
			resolve(yo.getGenerators());
		});
	});
}
