'use strict';

import {window, InputBoxOptions} from 'vscode';
import Prompt from './prompt';
import EscapeException from '../utils/EscapeException';

export default class ExpandPrompt extends Prompt {

	constructor(question: any) {
		super(question);
	}

	public render() {
		console.log(this._question);
	}
}
