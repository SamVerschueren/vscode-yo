'use strict';

import {window, OutputChannel, ViewColumn} from 'vscode';
import * as util from 'util';
import PromptFactory from '../prompts/factory';
import EscapeException from '../utils/EscapeException';

const logger = require('yeoman-environment/lib/util/log');
const diff = require('diff');

export default class CodeAdapter {

	public log = logger();
	private outChannel: OutputChannel;
	private outBuffer: string = '';

	constructor() {
		let self = this;

		this.outChannel = window.createOutputChannel('Yeoman');
		this.outChannel.clear();
		this.outChannel.show();

		// TODO Do not overwrite these methods
		console.error = console.log = function() {
			const line = util.format.apply(util, arguments);

			self.outBuffer += `${line}\n`;
			self.outChannel.appendLine(line);
			return this;
		};

		this.log.write = function() {
			const line = util.format.apply(util, arguments);

			self.outBuffer += line;
			self.outChannel.append(line);
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
				this.outChannel.clear();
				this.outChannel.append(this.outBuffer);

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
		this.outChannel.clear();

		let result = diff.diffLines(actual, expected);

		result.map(part => {
			let prefix = ' ';

			if (part.added === true) {
				prefix = '+';
			} else if (part.removed === true) {
				prefix = '-';
			}

			part.value = part.value.split('\n').map(line => {
				if (line.trim().length === 0) {
					return line;
				}

				return `${prefix}${line}`
			}).join('\n');

			this.outChannel.append(part.value);
		});
	}
}
