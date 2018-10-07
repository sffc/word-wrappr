/* eslint-env mocha */

"use strict";

const expect = require("expect.js");
const fs = require("fs");

const WordWrappr = require("..");

const TEST_CASES = [
	// String, Font Size, Width, [ Wrap Width, Wrapped Text ]
	[ "Lorem ipsum dolor sit amet", 12, 165.3046875, [
		[ 1000, ["Lorem ipsum dolor sit amet"] ],
		[ 100, ["Lorem ipsum", "dolor sit amet"] ],
		[ 0, ["Lorem", "ipsum", "dolor", "sit", "amet"] ],
	]],
	[ "Lorem ipsum dolor sit amet", 8, 165.3046875*8/12, [
		[ 1000, ["Lorem ipsum dolor sit amet"] ],
		[ 100, ["Lorem ipsum dolor sit", "amet"] ],
	]],
	[ "Lorem ipsum dolor", 12, 112.25390625, [
		[ 100, ["Lorem ipsum", "dolor"] ],
	]],
	[ "dolor sit amet", 12, 83.619140625, [
		[ 100, ["dolor sit amet"] ],
	]],
	[ "Lorem ipsum dolor sit amet", 0, 0, [
		[ 1000, ["Lorem ipsum dolor sit amet"] ],
	]],
	[ "", 12, 0, [
		[ 1000, [""] ],
	]],
	[ "Lorem   ipsum   dolor   sit   amet", 12, 195.8203125, [
		[ 1000, ["Lorem   ipsum   dolor   sit   amet"] ],
		[ 100, ["Lorem   ipsum", "dolor   sit   amet"] ],
		[ 0, ["Lorem", "ipsum", "dolor", "sit", "amet"] ],
	]],
	[ "AB", 12, 16.44140625, []],
	[ "A\u200BB", 12, 16.44140625, []],
	[ "iil lili illili lllli iiil liiilli llill illiil", 12, 160.060546875, [
		[ 1000, ["iil lili illili lllli iiil liiilli llill illiil"] ],
		[ 100, ["iil lili illili lllli iiil", "liiilli llill illiil"] ],
	]],
	[ "Lorem ipsum dolor sit amet, facilisis animi quam id mollis, vestibulum a mauris magna mi euismod, tristique lectus aliquam ut aliquet tristique, in amet mauris amet tellus, sed tempor diam vel lectus vitae. Elit et nonummy nunc vitae elit, pede cum non id adipiscing. Posuere cubilia ligula sodales, nisl placerat ipsum, libero odio pellentesque risus eu sagittis et, amet sit, ut vitae urna quis ac non. A eget nunc mauris wisi, purus ac aliquam, odio aliquam.", 12, 2742.76171875, [
		[ 500, [
			"Lorem ipsum dolor sit amet, facilisis animi quam id mollis, vestibulum a mauris",
			"magna mi euismod, tristique lectus aliquam ut aliquet tristique, in amet mauris",
			"amet tellus, sed tempor diam vel lectus vitae. Elit et nonummy nunc vitae elit,",
			"pede cum non id adipiscing. Posuere cubilia ligula sodales, nisl placerat ipsum,",
			"libero odio pellentesque risus eu sagittis et, amet sit, ut vitae urna quis ac non. A",
			"eget nunc mauris wisi, purus ac aliquam, odio aliquam.",
		]]
	]],
	[ "Lorem ipsum dolor sit amet, his dicant semper verterem ea, nec ea latine\r\ndolorum. Cum malorum forensibus definiebas te, ad wisi congue noster per.\r\nDebitis sensibus id sea, debitis adipisci perpetua at sea, ius aeque singulis\nno. Pro vidit consul detracto ad, velit dicunt te ius, nec cu unum oblique\nscripserit.", 12, 1883.208984375, [
		[ 500, [
			"Lorem ipsum dolor sit amet, his dicant semper verterem ea, nec ea latine",
			"dolorum. Cum malorum forensibus definiebas te, ad wisi congue noster per.",
			"Debitis sensibus id sea, debitis adipisci perpetua at sea, ius aeque singulis no. Pro",
			"vidit consul detracto ad, velit dicunt te ius, nec cu unum oblique scripserit.",
		]],
		[ 300, [
			"Lorem ipsum dolor sit amet, his dicant semper",
			"verterem ea, nec ea latine dolorum. Cum",
			"malorum forensibus definiebas te, ad wisi congue",
			"noster per. Debitis sensibus id sea, debitis",
			"adipisci perpetua at sea, ius aeque singulis no.",
			"Pro vidit consul detracto ad, velit dicunt te ius,",
			"nec cu unum oblique scripserit.",
		]]
	]]
];

const SERIF_TEST_CASES = [
	[ "Lorem ipsum dolor sit amet", 12, 186.720703125 ]
];

function ellipsis(text, width) {
	if (text.length > width) {
		return text.slice(0, width) + "\u2026";
	} else {
		return text;
	}
}

describe("WordWrappr", function() {

	// Asynchronous load function
	describe("#load()", function() {
		it("should load the font without errors", function(done) {
			var wrappr = new WordWrappr();
			wrappr.load((err) => {
				if (err) return done(err);
				try {
					expect(wrappr.font).to.be.ok();
				} catch(_err) {
					return done(_err);
				}
				done(null);
			});
		});
		it("should load from buffer without errors", function(done) {
			fs.readFile(WordWrappr.getDejaVuPath("DejaVuSerif", "Bold"), (err, buf) => {
				if (err) return done(err);
				var wrappr = new WordWrappr(buf);
				wrappr.load((err) => {
					done(err);
				});
			});
		});
	});

	// Synchronous load function
	describe("#loadSync()", function() {
		it("should load the font without errors", function() {
			var wrappr = new WordWrappr();
			wrappr.loadSync();
			expect(wrappr.font).to.be.ok();
		});
	});

	// Text width function with test cases from above
	describe("#computeWidth()", function() {
		var wrappr = new WordWrappr();
		wrappr.loadSync();
		for (let test of TEST_CASES) {
			it("should compute the width of '" + ellipsis(test[0], 30) + "' (size " + test[1] + ") to within 0.01% of " + test[2], function() {
				let width = wrappr.computeWidth(test[0], test[1]);
				expect(width).to.be.a("number");
				expect(width).to.be.within(test[2]*0.9999, test[2]*1.0001);
			});
		}
	});

	// Text wrap function with test cases from above
	describe("#wrap()", function() {
		var wrappr = new WordWrappr();
		wrappr.loadSync();
		for (let test of TEST_CASES) {
			for (let test1 of test[3]) {
				it("should wrap '" + ellipsis(test[0], 30) + "' (size " + test[1] + ", max width " + test1[0] + ") to " + test1[1].length + " lines", function() {
					let wrapped = wrappr.wrap(test[0], test[1], test1[0]);
					expect(wrapped).to.be.an(Array);
					// Make sure all the lines that could have been wrapped are within the max width
					for (let line of test1[1]) {
						let width = wrappr.computeWidth(line, test[1]);
						if (/\s/.test(line)) {
							expect(width).to.be.below(test1[0]);
						}
					}
					// Make sure actual is equal to the expected
					expect(wrapped).to.eql(test1[1]);
				});
			}
		}
	});

	// Using a different variant of DejaVu
	describe("#getDejaVuPath()", function() {
		var wrappr = new WordWrappr(WordWrappr.getDejaVuPath("DejaVuSerif", "Bold"));
		wrappr.loadSync();
		for (let test of SERIF_TEST_CASES) {
			it("should compute the width of '" + ellipsis(test[0], 30) + "' (size " + test[1] + ") in SERIF BOLD to within 0.01% of " + test[2], function() {
				let width = wrappr.computeWidth(test[0], test[1]);
				expect(width).to.be.a("number");
				expect(width).to.be.within(test[2]*0.9999, test[2]*1.0001);
			});
		}
	});
});
