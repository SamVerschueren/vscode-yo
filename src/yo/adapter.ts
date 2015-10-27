'use strict';

import {window} from 'vscode';
import PromptFactory from '../prompts/factory';

export default class CodeAdapter {

	public prompt(questions, callback) {
		var promise = questions.reduce((promise, question) => {
			return promise.then(() => {
				return PromptFactory.createPrompt(question);
			}).then(prompt => {
				return prompt.render();
			}).then(result => {
				console.log(result);
			});
		}, Promise.resolve());

		promise.catch(err => {
			window.showErrorMessage(err.message);
		});
	}

	public diff(actual, expected) {
		console.log(actual);
	}

	public log() {
		console.log(arguments);
	}
}
