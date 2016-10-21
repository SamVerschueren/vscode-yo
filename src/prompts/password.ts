import InputPrompt from './input';

export default class PasswordPrompt extends InputPrompt {

	constructor(question: any, answers: any) {
		super(question, answers);

		this._options.password = true;
	}
}
