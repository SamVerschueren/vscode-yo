'use strict';

import Prompt from './prompt';
import InputPrompt from './input';

export default class PromptFactory {
	public static createPrompt(question: any): Prompt {
		switch(question.type || 'input') {
			default:
				return new InputPrompt(question);
		}
	}
}
