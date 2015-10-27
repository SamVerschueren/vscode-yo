'use strict';

import Prompt from './prompt';
import InputPrompt from './input';
import ListPrompt from './list';
import ConfirmPrompt from './confirm';

export default class PromptFactory {
	public static createPrompt(question: any): Prompt {
		/**
		 * - confirm
		 * - folder
		 * - expand
		 * - checkbox
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
			default:
				throw new Error(`Could not find a prompt for question type ${question.type}`);
		}
	}
}
