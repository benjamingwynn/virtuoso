/* eslint-env es6, browser */

(function () {
	"use strict";

	const chainloadr = window.chainloadr;

	function strReplace (target, replaceThis, withThis) {
		return target.split(replaceThis).join(withThis);
	}

	chainloadr(["vue@2", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.js"], () => {
		chainloadr("https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-markdown.js", () => {
			const Vue = window.Vue;

			window.virtuoso = new Vue({
				"el": ".virtuoso",

				"data": {
					"unformattedMarkdown": "# virtuoso\n\nvirtuoso enables use of the browsers built-in autocorrect, while still allowing use of *markdown* **syntax** _highlighting_. Prism.js is used for syntax highlighting and Vue.js is used to tie everything together.\n\nTechnically, it works using a <textarea> element and a standard <div> in tandem, then simply renders the same content in both elements but displays the <textarea> on top with transparent text using some clever CSS.\n\nCreated by [Benjamin Gwynn](http://xenxier.com)\n\nthis is a    **  test **  !"
				},

				"methods": {
					updateScrollState (event) {
						this.$el.querySelector(".virtuoso-syntax").scrollTop = event.target.scrollTop;
					},

					surround (stripInner, insBefore, optInsAfter) {
						const
							insAfter = optInsAfter || insBefore,
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
								after = str.substring(selEnd, str.length),
								insBeforeLen = insBefore.length,
								insAfterLen = insAfter.length,
								posInsBeforeInTrimmed = selectedTrimmed.indexOf(insBefore),
								posInsAfterInTrimmed = selectedTrimmed.lastIndexOf(insAfter),
								expectedIndexBefore = 0,
								expectedIndexAfter = selectedTrimmed.length - insAfterLen,
								nSpacesLeftSurrounding = before.length - before.trimRight().length,
								nSpacesRightSurrounding = after.length - after.trimLeft().length,
								outsideBeforeSelectionEnd = selStart - nSpacesLeftSurrounding,
								outsideBeforeSelectionStart = outsideBeforeSelectionEnd - insBeforeLen,
								onOutsideBefore = str.substring(outsideBeforeSelectionStart, outsideBeforeSelectionEnd),
								isBeforeSelectionOutside = onOutsideBefore === insBefore,
								outsideAfterSelectionStart = selEnd + nSpacesRightSurrounding,
								outsideAfterSelectionEnd = outsideAfterSelectionStart + insAfterLen,
								onOutsideAfter = str.substring(outsideAfterSelectionStart, outsideAfterSelectionEnd),
								isAfterSelectionOutside = onOutsideAfter === insAfter;

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

							// surrounded inside of selection
							if (posInsBeforeInTrimmed === expectedIndexBefore && posInsAfterInTrimmed === expectedIndexAfter) {
								const selectionWithoutSurrounded = selectedTrimmed.substring(expectedIndexBefore + insBeforeLen, expectedIndexAfter);

								this.unformattedMarkdown = `${before}${spacesLeft}${selectionWithoutSurrounded}${spacesRight}${after}`;

								return;
							}

							// surround outside of selection
							if (isBeforeSelectionOutside && isAfterSelectionOutside) {
								const
									start = str.substring(0, outsideBeforeSelectionStart),
									middle = str.substring(outsideBeforeSelectionEnd, outsideAfterSelectionStart),
									end = str.substring(outsideAfterSelectionEnd, str.length);

								this.unformattedMarkdown = `${start}${spacesLeft}${middle}${spacesRight}${end}`;

								return;
							}

							if (stripInner) {
								const selectedStripped = strReplace(strReplace(selectedTrimmed, insBefore, ""), insAfter, "");

								this.unformattedMarkdown = `${before}${spacesLeft}${insBefore}${selectedStripped}${insAfter}${spacesRight}${after}`;
							} else {
								this.unformattedMarkdown = `${before}${spacesLeft}${insBefore}${selectedTrimmed}${insAfter}${spacesRight}${after}`;
							}
						}
					}
				},

				"computed": {
					highlightedSyntax () {
						const
							highlighted = window.Prism.highlight(this.unformattedMarkdown, window.Prism.languages.markdown),
							properNewLine = strReplace(highlighted, "\n", "<br />");

						return properNewLine;
					}
				}
			});
		});
	});
}());
