'use strict';

import {window} from 'vscode';
import PromptFactory from '../prompts/factory';

export default class CodeAdapter {

	public prompt(questions, callback) {
		let answers = {};

		var promise = questions.reduce((promise, question) => {
			return promise.then(() => {
				return PromptFactory.createPrompt(question);
			}).then(prompt => {
				return prompt.render();
			}).then(result => {
				answers[question.name] = result;
			});
		}, Promise.resolve());

		promise
			.then(() => {
				console.log(JSON.stringify(answers, undefined, '  '));
				callback(answers);
			})
			.catch(err => {
				window.showErrorMessage(err.message);
			});
	}

	public diff(actual, expected) {
		console.log(actual);
	}

	public log = require('yeoman-environment/lib/util/log')();
}
