'use strict';

import Prompt from './prompt';
import InputPrompt from './input';
import ListPrompt from './list';

export default class PromptFactory {
	public static createPrompt(question: any): Prompt {
		switch (question.type || 'input') {
			case 'list':
				return new ListPrompt(question);
			default:
				return new InputPrompt(question);
		}
	}
}
