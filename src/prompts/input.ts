'use strict';

import {window, InputBoxOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

const figures = require('figures');

export default class InputPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		let placeHolder = this._question.default;

		if (this._question.default instanceof Error) {
			placeHolder = this._question.default.message;
			this._question.default = undefined;
		}

		const options: InputBoxOptions = {
			prompt: this._question.message,
			placeHolder: placeHolder
		};

		return window.showInputBox(options)
			.then(result => {
				if (result === undefined) {
					throw new EscapeException();
				}

				if (result === '') {
					result = this._question.default || '';
				}

				const valid = this._question.validate ? this._question.validate(result || '') : true;

				if (valid !== true) {
					this._question.default = new Error(`${figures.warning} ${valid}`);

					return this.render();
				}

				return result;
			});
	}
}
