/* eslint-env es6, browser */

(function () {
	"use strict";

	const
		chainloadr = window.chainloadr,
		template = `<div class="virtuoso">
						<div class="virtuoso-ctrls">
							<div class="virtuoso-formatting-ctrls">
								<button class="bold" v-on:click="surround(true, '**')" type="button"></button>
								<button class="italic" v-on:click="surround(true, '*')" type="button"></button>
							</div>

							<div class="virtuoso-zoom-ctrls">
								<button class="zoom-out" v-on:click="zoomIn(-0.1)" type="button"></button>
								<div class="zoom-val">{{zoom}}</div>
								<button class="zoom-in" v-on:click="zoomIn(0.1)" type="button"></button>
							</div>
						</div>

						<div class="virtuoso-inner" v-bind:style="{fontSize: zoom + 'em' }">
							<div class="virtuoso-syntax" v-html="highlightedSyntax"></div>
							<textarea class="virtuoso-text" v-on:scroll="updateScrollState" v-model="unformattedMarkdown">{{unformattedMarkdown}}</textarea>
						</div>
					</div> `;

	function strReplace (target, replaceThis, withThis) {
		return target.split(replaceThis).join(withThis);
	}

	chainloadr(["vue@2", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.js"], () => {
		chainloadr("https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-markdown.js", () => {
			const Vue = window.Vue;

			Vue.component("virtuoso-editor", {
				template,

				"methods": {
					updateScrollState (event) {
						this.$el.querySelector(".virtuoso-syntax").scrollTop = event.target.scrollTop;
					},

					zoomIn (zoomage) {
						const asFloat = Math.min(2, Math.max(0.1, parseFloat(this.zoom) + zoomage));

						this.zoom = asFloat.toFixed(1);
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

				data () {
					return {
						"unformattedMarkdown": this.$slots.default[0].text,
						"zoom": "1.0"
					}
				},

				"computed": {
					highlightedSyntax () {
						if (this.unformattedMarkdown) {
							const
								highlighted = window.Prism.highlight(this.unformattedMarkdown, window.Prism.languages.markdown),
								properNewLine = strReplace(highlighted, "\n", "<br />");

							return properNewLine;
						}

						return "";
					}
				}
			});

			document.querySelectorAll("virtuoso-editor").forEach((element) => new Vue({"el": element}));
		});
	});
}());
