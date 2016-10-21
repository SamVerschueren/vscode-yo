import { window, InputBoxOptions } from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';
import runAsync from '../utils/run-async';

const figures = require('figures');

export default class InputPrompt extends Prompt {

	protected _options: InputBoxOptions;

	constructor(question: any, answers: any) {
		super(question, answers);

		this._options = {
			prompt: this._question.message
		};
	}

	public render() {
		return runAsync(this._question.default)(this._answers)
			.then(placeHolder => {
				if (placeHolder instanceof Error) {
					placeHolder = placeHolder.message;
					this._question.default = undefined;
				}

				this._options.placeHolder = placeHolder;

				return window.showInputBox(this._options);
			})
			.then(result => {
				if (result === undefined) {
					throw new EscapeException();
				}

				if (result === '') {
					result = this._options.placeHolder || '';
				}

				return runAsync(this._question.validate)(result || '')
					.then(valid => {
						if (valid !== undefined && valid !== true) {
							this._question.default = new Error(`${figures.warning} ${valid}`);

							return this.render();
						}

						return result;
					});
			});
	}
}
