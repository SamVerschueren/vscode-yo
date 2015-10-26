'use strict';

import PromptFactory from '../prompts/factory';

export default class CodeAdapter {

	public prompt(questions, callback) {
		questions.reduce((promise, question) => {
			return promise.then(() => {
				return PromptFactory.createPrompt(question);
			}).then(prompt => {
				return prompt.render();
			}).then(result => {
				console.log(result);
			});
		}, Promise.resolve());
	}

	public diff(actual, expected) {
		console.log(actual);
	}

	public log() {
		console.log(arguments);
	}
}
