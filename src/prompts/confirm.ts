'use strict';

import {window, QuickPickItem, QuickPickOptions} from 'vscode';
import Prompt from './prompt';

export default class ConfirmPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		const choices = {
			"Yes": true,
			"No": false
		};

		const options: QuickPickOptions = {
			placeHolder: this._question.message
		};

		return window.showQuickPick(Object.keys(choices), options)
			.then(result => {
				if (choices[result] === undefined) {
					return this.render();
				}

				return choices[result];
			});
	}
}
