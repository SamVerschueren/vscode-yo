'use strict';

import {window, QuickPickItem, QuickPickOptions} from 'vscode';
import Prompt from './prompt';

const figures = require('figures');

export default class CheckboxPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		let choices = this._question.choices.reduce((result, choice) => {
			result[`${choice.checked === true ? figures.radioOn : figures.radioOff} ${choice.name}`] = choice;
			return result;
		}, {});

		const options: QuickPickOptions = {
			placeHolder: `${this._question.message} (Press Esc to continue)`
		};

		return window.showQuickPick(Object.keys(choices), options)
			.then(result => {
				if (result !== undefined) {
					choices[result].checked = !choices[result].checked;

					return this.render();
				}

				return this._question.choices.reduce((result, choice) => {
					if (choice.checked === true) {
						result.push(choice.value);
					}

					return result;
				}, []);
			});
	}
}
