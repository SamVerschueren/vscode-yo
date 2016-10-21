abstract class Prompt {

	protected _question: any;
	protected _answers: any;

	constructor(question: any, answers?: any) {
		this._question = question;
		this._answers = answers;
	}

	public abstract render();
}

export default Prompt;
