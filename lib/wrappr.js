"use strict";

const fs = require("fs");
const opentype = require("opentype.js");
const getDejaVuPath = require("./dejavu");

const DEFAULT_TTF_PATH = getDejaVuPath("DejaVuSans");


function nodeBufferToArrayBuffer(buffer) {
	var ab = new ArrayBuffer(buffer.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buffer.length; ++i) {
		view[i] = buffer[i];
	}
	return ab;
}


class WordWrappr {
	constructor(ttfPathOrBuffer) {
		if (Buffer.isBuffer(ttfPathOrBuffer)) {
			this.buffer = ttfPathOrBuffer;
		} else {
			this.ttfPath = ttfPathOrBuffer || DEFAULT_TTF_PATH;
		}
		this.font = null;
	}

	load(next) {
		if (this.buffer) {
			// No file I/O required
			try {
				this.loadSync();
			} catch(err) {
				return next(err);
			}
			return next(null);
		}

		fs.readFile(this.ttfPath, (err, buffer) => {
			if (err) {
				next(err);
				return;
			}
			try {
				var arrayBuffer = nodeBufferToArrayBuffer(buffer);
				this.font = opentype.parse(arrayBuffer);
			} catch(err) {
				next(err);
				return;
			}
			next(null);
		});
	}

	loadSync() {
		var buffer = this.buffer || fs.readFileSync(this.ttfPath);
		var arrayBuffer = nodeBufferToArrayBuffer(buffer);
		this.font = opentype.parse(arrayBuffer);
		this.buffer = null;  // free memory
	}

	computeWidth(input, fontSize) {
		if (this.font === null) {
			throw new Error("Font is not loaded yet.  Please call load() or loadSync() first.");
		}

		// Uses algorithm based on https://developer.tizen.org/community/tip-tech/working-fonts-using-opentype.js
		const glyphs = this.font.stringToGlyphs(input);
		const scale = 1 / this.font.unitsPerEm * fontSize;
		let width = 0;
		for (let i=0; i<glyphs.length; i++) {
			let glyph = glyphs[i];
			if (glyph.advanceWidth) {
				width += glyph.advanceWidth * scale;
			}
			if (i < glyphs.length - 1) {
				width += this.font.getKerningValue(glyph, glyphs[i + 1]) * scale;
			}
		}
		return width;
	}

	wrap(input, fontSize, maxWidth) {
		const iterator = new StringIterator(input);
		const lines = [];
		let currLine = "";
		let currWidth = 0;
		while (iterator.hasNext()) {
			let space_word = iterator.next();

			// Replace strings of newline characters with a single space to allow for re-wrapping of previously hard-wrapped text
			space_word[0] = space_word[0].replace(/[\r\n]+/g, "\u0020");

			let spaceWidth = this.computeWidth(space_word[0], fontSize);
			let wordWidth = this.computeWidth(space_word[1], fontSize);
			if (currWidth === 0 || currWidth + spaceWidth + wordWidth <= maxWidth) {
				currLine += space_word[0] + space_word[1];
				currWidth += spaceWidth + wordWidth;
			} else {
				lines.push(currLine);
				currWidth = wordWidth;
				currLine = space_word[1];
			}
		}
		lines.push(currLine);
		return lines;
	}
}

// TODO: It would be better to use something like ICU's break iterator here.
class StringIterator {
	constructor(input) {
		this.input = input;
		this.index = 0;
	}

	next() {
		let nextSpace = "";
		let nextWord = "";
		for (; this.index<this.input.length; this.index++) {
			let ch = this.input[this.index];
			if (/\s/.test(ch)) {
				if (nextWord === "") {
					nextSpace += ch;
					continue;
				} else {
					break;
				}
			} else {
				nextWord += ch;
			}
		}

		return [nextSpace, nextWord];
	}

	hasNext() {
		return this.index < this.input.length;
	}
}

module.exports = WordWrappr;
