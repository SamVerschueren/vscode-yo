'use strict';

import {window, OutputChannel} from 'vscode';
import * as util from 'util';
import PromptFactory from '../prompts/factory';
import EscapeException from '../utils/EscapeException';

const logger = require('yeoman-environment/lib/util/log');

export default class CodeAdapter {

	public log = logger();

	constructor() {
		const outChannel: OutputChannel = window.createOutputChannel('Yeoman');
		outChannel.show();

		// TODO Do not overwrite these methods
		console.error = console.log = function() {
			outChannel.appendLine(util.format.apply(util, arguments));
			return this;
		};

		this.log.write = function() {
			outChannel.append(util.format.apply(util, arguments));
			return this;
		};
	}

	public prompt(questions, callback) {
		let answers = {};

		var promise = questions.reduce((promise, question) => {
			return promise.then(() => {
				return PromptFactory.createPrompt(question);
			}).then(prompt => {
				if (!question.when || question.when(answers) === true) {
					return prompt.render().then(result => answers[question.name] = question.filter ? question.filter(result) : result);
				}
			});
		}, Promise.resolve());

		promise
			.then(() => {
				callback(answers);
			})
			.catch(err => {
				if (err instanceof EscapeException) {
					return;
				}

				window.showErrorMessage(err.message);
			});
	}

	public diff(actual, expected) {
		console.log(actual);
	}
}
