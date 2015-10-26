'use strict';

import {window, QuickPickItem, QuickPickOptions} from 'vscode';
import Prompt from './prompt';

export default class ListPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		const choices = this._question.choices.reduce((result, choice) => {
			result[choice.name] = choice.value;
			return result;
		}, {});

		const options: QuickPickOptions = {
			 placeHolder: this._question.message
		};

		return window.showQuickPick(Object.keys(choices), options)
			.then(result => {
				return choices[result];
			});
	}
}
