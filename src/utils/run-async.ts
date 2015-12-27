'use strict';

import {window} from 'vscode';

const runAsync = require('run-async');

// Helper function that will show a progress bar while running a function async
export default function(func): Function {
	const fn = runAsync(func);

	return function(): Promise<Boolean> {
		const args = Array.prototype.slice.call(arguments);

		return new Promise((resolve, reject) => {
			Promise.resolve(window.showQuickPick(new Promise((res, rej) => {
				fn.apply(fn, args)
					.then(result => {
						rej();

						resolve(result);
					})
					.catch(err => {
						rej();

						reject(err);
					});
			}))).catch(err => {
				// do nothing because the input is always rejected
			});
		});
	};
}
