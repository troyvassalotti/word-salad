import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * @tag word-salad
 * @summary Generates word salad from a custom word bank.
 */
@customElement('word-salad')
export default class WordSalad extends LitElement {
	/** Full list of words to be used. */
	@property()
	bank = '';

	/** The character to split on when creating an array of individual words. */
	@property()
	separator: ',' | ' ' = ',';

	/** Minimum words per sentence when generating full sentences. */
	@property({ type: Number })
	minWordsPerSentence: number = 3;

	/** Maximum words per sentence when generating full sentences. */
	@property({ type: Number })
	maxWordsPerSentence: number = 20;

	/** Total number of type to generate. */
	@state()
	number: number = 10;

	/** What should be generated. */
	@state()
	type: 'words' | 'sentences' = 'words';

	/** The final output based on number and type. */
	@state()
	output: TemplateResult = html`Awaiting word salad...`;

	/** Filtered word bank. */
	private get wordBank(): string[] {
		const SPLIT_ITEMS = this.bank.split(this.separator);
		const SORTED_AND_MODDED = SPLIT_ITEMS.map((item) =>
			item.trim().toLocaleLowerCase()
		);

		return [...new Set(SORTED_AND_MODDED)];
	}

	/**
	 * Changes the component type based on form selection.
	 * @param e Input event object from the select field.
	 */
	private handleOptionSelection(e: InputEvent): void {
		const VALUE = (e.target as HTMLSelectElement).value;

		if (VALUE === 'words' || VALUE === 'sentences') {
			this.type = VALUE;
		} else {
			console.warn(
				'Somehow a different value was provided! We defaulted back to "words" as your selection.'
			);

			this.type = 'words';
		}
	}

	/**
	 * Sets the total number of type to generate.
	 * @param e Input event object from the number field.
	 */
	private handleRequestCount(e: InputEvent): void {
		this.number = Number((e.target as HTMLInputElement).value);
	}

	/**
	 * The form's submit method.
	 * @param e Submit event from the form.
	 */
	private handleFormSubmit(e: SubmitEvent) {
		e.preventDefault();
		this.output = this.generateOutput();
	}

	/**
	 * Generates the full HTML for the given type.
	 * @returns HTML for output based on type.
	 */
	private generateOutput(): TemplateResult {
		if (this.number > 250) {
			return (this.output = html`Hey now, don't try to generate more than 250 of
			whatever you want, okay?`);
		}

		switch (this.type) {
			case 'sentences':
				return this.generateSentences();
			case 'words':
			default:
				return this.generateWords();
		}
	}

	/**
	 * Creates sentences full of randomized words.
	 * @returns HTML for sentence output.
	 */
	private generateSentences(): TemplateResult {
		const SENTENCES = [];
		let sentence = [];

		for (let x = 0; x < this.number; x++) {
			const WORD_COUNT = randomNumber(
				this.minWordsPerSentence,
				this.maxWordsPerSentence
			);

			for (let y = 0; y < WORD_COUNT; y++) {
				let word =
					this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
				if (y === 0) {
					const CAPITAL = word.charAt(0).toUpperCase() + word.slice(1);
					sentence.push(CAPITAL);
				} else {
					sentence.push(word.toLowerCase());
				}
			}
			SENTENCES.push(`${sentence.join(' ')}.`);

			sentence = [];
		}

		return html`${SENTENCES.join(' ')}`;
	}

	/**
	 * Creates a single sentence of random words.
	 * @returns HTML for word output.
	 */
	private generateWords(): TemplateResult {
		const WORDS = [];

		for (let x = 0; x < this.number; x++) {
			let word =
				this.wordBank[Math.floor(Math.random() * this.wordBank.length)];
			WORDS.push(word.toLocaleLowerCase());
		}

		return html`${WORDS.join(' ')}.`;
	}

	render(): TemplateResult {
		return html`<form @submit=${this.handleFormSubmit} part="form">
				<div class="field">
					<label for="requestType">What flavor do you want?</label>
					<select
						name="requestType"
						id="requestType"
						@input=${this.handleOptionSelection}
					>
						<option value="words">Words</option>
						<option value="sentences">Sentences</option>
					</select>
				</div>
				<div class="field">
					<label for="requestCount">How many orders?</label>
					<input
						id="requestCount"
						name="requestCount"
						type="number"
						autofocus
						@input=${this.handleRequestCount}
						.value=${this.number}
					/>
				</div>
				<button type="submit" part="submit">Submit</button>
			</form>
			<div part="output">${this.output}</div>`;
	}
}

/**
 * Random number generator.
 * @param min
 * @param max
 * @returns A random number
 */
function randomNumber(min: number = 3, max: number = 20): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
