'use strict';

import Prompt from './prompt';
import InputPrompt from './input';
import ListPrompt from './list';
import ConfirmPrompt from './confirm';
import CheckboxPrompt from './checkbox';

export default class PromptFactory {
	public static createPrompt(question: any): Prompt {
		/**
		 * TODO:
		 *   - folder
		 *   - expand
		 */
		switch (question.type || 'input') {
			case 'string':
			case 'input':
			case 'password':
				return new InputPrompt(question);
			case 'list':
				return new ListPrompt(question);
			case 'confirm':
				return new ConfirmPrompt(question);
			case 'checkbox':
				return new CheckboxPrompt(question);
			default:
				throw new Error(`Could not find a prompt for question type ${question.type}`);
		}
	}
}
