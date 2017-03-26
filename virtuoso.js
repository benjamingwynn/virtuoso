/* eslint-env es6, browser */

(function () {
	"use strict";

	function strReplace (target, replaceThis, withThis) {
		return target.split(replaceThis).join(withThis);
	}

	chainloadr(["vue@2", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.js"], () => {
		chainloadr("https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-markdown.js", () => {
			const Vue = window.Vue;

			window.virtuoso = new Vue({
				"el": ".virtuoso",

				"data": {
					"unformattedMarkdown": "# virtuoso\n\nvirtuoso enables use of the browsers built-in autocorrect, while still allowing use of *markdown* **syntax** _highlighting_. Prism.js is used for syntax highlighting and Vue.js is used to tie everything together.\n\nTechnically, it works using a <textarea> element and a standard <div> in tandem, then simply renders the same content in both elements but displays the <textarea> on top with transparent text using some clever CSS.\n\nCreated by [Benjamin Gwynn](http://xenxier.com)"
				},

				"methods": {
					updateScrollState (event) {
						this.$el.querySelector(".virtuoso-syntax").scrollTop = event.target.scrollTop;
					},

					surround (insBefore, insAfter) {
						const
							textarea = this.$el.querySelector(".virtuoso-text"),
							str = this.unformattedMarkdown,
							selStart = textarea.selectionStart,
							selEnd = textarea.selectionEnd,
							selected = str.substring(selStart, selEnd),
							selectedLength = selected.length,
							selectedTrimmed = selected.trim();

						if (selectedTrimmed.length) {
							const
								nSpacesLeft = selectedLength - selected.trimLeft().length,
								nSpacesRight = selectedLength - selected.trimRight().length,
								before = str.substring(0, selStart),
								after = str.substring(selEnd, str.length);

							let spacesLeft,
								spacesRight;

							spacesLeft = "";
							while (spacesLeft.length !== nSpacesLeft) {
								spacesLeft = ` ${spacesLeft}`;
							}

							spacesRight = "";
							while (spacesRight.length !== nSpacesRight) {
								spacesRight = `${spacesRight} `;
							}

							this.unformattedMarkdown = `${before}${spacesLeft}${insBefore}${selectedTrimmed}${insAfter || insBefore}${spacesRight}${after}`;
						}
					}
				},

				"computed": {
					highlightedSyntax () {
						const
							highlighted = window.Prism.highlight(this.unformattedMarkdown, Prism.languages.markdown),
							properNewLine = strReplace(highlighted, "\n", "<br />");

						return properNewLine;
					}
				}
			});
		});
	});
}());
