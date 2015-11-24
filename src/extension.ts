'use strict';

import {window, workspace, commands, ExtensionContext, QuickPickItem, InputBoxOptions} from 'vscode';
import EscapeException from './utils/EscapeException'
import Yeoman from './yo/yo';

const path = require('path');
const fs = require('fs');
const figures = require('figures');

export function activate(context: ExtensionContext) {
	const cwd = workspace.rootPath;

	const disposable = commands.registerCommand('yo', () => {
		const yo = new Yeoman();

		let main, sub;

		if (!cwd) {
			window.showErrorMessage('Please open a workspace directory first.');
			return;
		}

		Promise.resolve(window.showQuickPick(list(yo)))
			.then((generator: any) => {
				if (generator === undefined) {
					throw new EscapeException();
				}

				main = generator.label;

				if (generator.subGenerators.length > 1) {
					return runSubGenerators(generator.subGenerators);
				} else {
					return 'app';
				}
			})
			.then(subGenerator => {
				if (subGenerator === undefined) {
					throw new EscapeException();
				}

				sub = subGenerator;

				try {
					yo.run(`${main}:${sub}`, cwd);
				} catch (err) {
					if (err.message.toLowerCase() === 'did not provide required argument name!') {
						const options: InputBoxOptions = {
							prompt: `${subGenerator} name?`
						};

						return window.showInputBox(options);
					}

					throw err;
				}
			})
			.then(argument => {
				if (argument !== undefined) {
					yo.run(`${main}:${sub} ${argument}`, cwd);
				}
			})
			.catch(err => {
				if (err instanceof EscapeException) {
					return;
				}

				window.showErrorMessage(err.message || err);
			});
	});

	context.subscriptions.push(disposable);
}

function runSubGenerators(subGenerators: string[]) {
	const app = `${figures.star} app`;
	const index = subGenerators.indexOf('app');

	if (index !== -1) {
		subGenerators.splice(index, 1);
		subGenerators.unshift(app);
	}

	return window.showQuickPick(subGenerators)
		.then(choice => {
			if (choice === app) {
				return 'app';
			}

			return choice;
		});
}

function list(yo: Yeoman): Promise<QuickPickItem[]> {
	return new Promise(resolve => {
		yo.getEnvironment().lookup(() => {
			resolve(yo.getGenerators().map(generator => {
				return {
					label: generator.name.split(/\-(.+)?/)[1],
					description: generator.description,
					subGenerators: generator.subGenerators
				};
			}));
		});
	});
}
