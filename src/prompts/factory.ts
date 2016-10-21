import Prompt from './prompt';
import InputPrompt from './input';
import PasswordPrompt from './password';
import ListPrompt from './list';
import ConfirmPrompt from './confirm';
import CheckboxPrompt from './checkbox';
import ExpandPrompt from './expand';

export default class PromptFactory {

	public static createPrompt(question: any, answers: any): Prompt {
		/**
		 * TODO:
		 *   - folder
		 */
		switch (question.type || 'input') {
			case 'string':
			case 'input':
				return new InputPrompt(question, answers);
			case 'password':
				return new PasswordPrompt(question, answers);
			case 'list':
				return new ListPrompt(question);
			case 'confirm':
				return new ConfirmPrompt(question);
			case 'checkbox':
				return new CheckboxPrompt(question);
			case 'expand':
				return new ExpandPrompt(question);
			default:
				throw new Error(`Could not find a prompt for question type ${question.type}`);
		}
	}
}
