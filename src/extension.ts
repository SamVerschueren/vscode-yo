'use strict';

import {window, workspace, commands, ExtensionContext, QuickPickItem, InputBoxOptions} from 'vscode';
import EscapeException from './utils/EscapeException';
import runAsync from './utils/run-async';
import Yeoman from './yo/yo';

const path = require('path');
const fs = require('fs');
const figures = require('figures');
const opn = require('opn');

export function activate(context: ExtensionContext) {
	const cwd = workspace.rootPath;

	const disposable = commands.registerCommand('yo', () => {
		if (!cwd) {
			window.showErrorMessage('Please open a workspace directory first.');
			return;
		}
		const yo = new Yeoman({cwd});

		let main;
		let sub;

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

				return yo.run(`${main}:${sub}`, cwd);
			})
			.catch(err => {
				const regexp = new RegExp('Did not provide required argument (.*?)!', 'i');

				if (err) {
					const match = err.message.match(regexp);

					if (match) {
						return `${sub} ${match[1]}?`;
					}
				}

				throw err;
			})
			.then((question: any) => {
				return window.showInputBox({prompt: question})
					.then(input => {
						if (!input) {
							throw new EscapeException();
						}

						return input;
					});
			})
			.then(argument => {
				return yo.run(`${main}:${sub} ${argument}`, cwd);
			})
			.catch(err => {
				if (!err || err instanceof EscapeException) {
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
	return new Promise((resolve, reject) => {
		setImmediate(() => {
			yo.getEnvironment().lookup(() => {
				const generators = yo.getGenerators().map(generator => {
					return {
						label: generator.name.split(/\-(.+)?/)[1],
						description: generator.description,
						subGenerators: generator.subGenerators
					};
				});

				if (generators.length === 0) {
					reject();

					window.showInformationMessage('Make sure to install some generators first.', 'more info')
						.then(choice => {
							if (choice === 'more info') {
								opn('http://yeoman.io/learning/');
							}
						});

					return;
				}

				resolve(generators);
			});
		});
	});
}
