import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * @tag word-salad
 * @summary Generates word salad from a custom word bank.
 *
 * @slot selection-label - Text for the selection's label.
 * @slot number-label - Text for the number's label.
 * @slot submit-label - Text for the submit button.
 * @slot idle-text - Text for the area shown when no input was given.
 *
 * @csspart form - Form element.
 * @csspart selection-field - Wrapper for the selection label and input.
 * @csspart selection-label - Label element for the selection.
 * @csspart selection-input - Input element for the selection input.
 * @csspart number-field - Wrapper for the number label and input.
 * @csspart number-label - Label element for the number.
 * @csspart number-input - Input element for the number input.
 * @csspart submit - Submit button.
 * @csspart output - Output element for the resulting salad.
 */
@customElement('word-salad')
export default class WordSalad extends LitElement {
	static get styles() {
		return css`
			:host {
				box-sizing: border-box;
				display: block;
			}

			*,
			*::after,
			*::before {
				box-sizing: inherit;
			}

			input,
			select,
			button {
				font: inherit;
			}
		`;
	}
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

	/** Maximum number of sentences or words that can be generated. */
	@property({ type: Number })
	maxNumber: number = 250;

	/** Total number of type to generate. */
	@state()
	number: number = 10;

	/** What should be generated. */
	@state()
	type: 'words' | 'sentences' = 'words';

	/** The final output based on number and type. */
	@state()
	output: TemplateResult | undefined;

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
		if (this.number > this.maxNumber) {
			return (this.output = html`Hey now, don't try to generate more than
			${this.maxNumber} of whatever you want, okay?`);
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
		return html`
			<form @submit=${this.handleFormSubmit} part="form">
				<div class="field" part="selection-field">
					<label for="requestType" part="selection-label">
						<slot name="selection-label">What flavor do you want?</slot>
					</label>
					<select
						part="selection-input"
						name="requestType"
						id="requestType"
						@input=${this.handleOptionSelection}
					>
						<option value="words">Words</option>
						<option value="sentences">Sentences</option>
					</select>
				</div>
				<div class="field" part="number-field">
					<label for="requestCount" part="number-label">
						<slot name="number-label">How many orders?</slot>
					</label>
					<input
						part="number-input"
						id="requestCount"
						name="requestCount"
						type="number"
						@input=${this.handleRequestCount}
						.value=${this.number}
					/>
				</div>
				<button type="submit" part="submit">
					<slot name="submit">Submit</slot>
				</button>
			</form>
			<output part="output">${this.output}</output>
			<div style="display: ${this.output ? 'none' : 'block'};">
				<slot name="idle-text">Awaiting word salad...</slot>
			</div>
		`;
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
