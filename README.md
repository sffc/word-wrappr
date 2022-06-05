Word Wrappr
===========

A library that wraps text according to the rendered font width rather than the number of characters.  Uses [opentype.js](https://github.com/nodebox/opentype.js) for computing text widths and [DejaVu Sans](http://dejavu-fonts.org/wiki/Main_Page) as the default reference font.  There is a Node.js API as well as a command-line interface.

This library is ***experimental-quality*** because it does not currently support complex scripts or UTR 14 breakpoints.

[![Node.js CI](https://github.com/sffc/word-wrappr/workflows/Node.js%20CI/badge.svg)](https://github.com/sffc/word-wrappr/actions)
[![Known Vulnerabilities](https://snyk.io/test/github/sffc/word-wrappr/badge.svg)](https://snyk.io/test/github/sffc/word-wrappr)
[![npm version](http://img.shields.io/npm/v/word-wrappr.svg?style=flat)](https://npmjs.org/package/word-wrappr "View this project on npm")


## Installation

For use in your application:

```
$ npm install --save word-wrappr
```

For use as a CLI utility:

```
$ npm install -g word-wrappr
```

The CLI utility is named `wrappr`.  For more details on the CLI, run `wrappr --help`.

## Example

The module requires that DejaVu Sans be loaded from a TTF file into memory, which is an I/O operation.  You can perform this step either synchronously or asynchronously.

**Tip:** In most cases, you should create a singleton instance of WordWrappr so that data loading happens only once, during the startup of your application.

### Synchronous Loading

```javascript
"use strict";
const WordWrappr = require("word-wrappr");

// Load the DejaVu font into memory.
var wrappr = new WordWrappr();
wrappr.loadSync();

// Use the module.
var lines = wrappr.wrap("Lorem ipsum dolor sit amet", 12, 100);  // Font size 12, wrap to width 100
console.log(lines);  // => [ 'Lorem ipsum', 'dolor sit amet' ]
```

### Asynchronous Loading

```javascript
"use strict";
const WordWrappr = require("word-wrappr");

// Load the DejaVu font into memory.
var wrappr = new WordWrappr();
wrappr.load((err) => {
	if (err) return console.error(err);

	// Use the module.
	var lines = wrappr.wrap("Lorem ipsum dolor sit amet", 12, 100);  // Font size 12, wrap to width 100
	console.log(lines);  // => [ 'Lorem ipsum', 'dolor sit amet' ]
});
```

## More Features

### Custom Font File

You can pass the path to a custom font file into the constructor.

```javascript
var wrappr = new WordWrappr("/path/to/my/font.ttf");
```

To load a different face or style of DejaVu:

```javascript
var wrappr = new WordWrappr(WordWrappr.getDejaVuPath("DejaVuSerif", "Bold"));
```

Possible faces and styles include:

- DejaVuSans
	- Bold
	- BoldOblique
	- ExtraLight
	- Oblique
- DejaVuSansCondensed
	- Bold
	- BoldOblique
	- Oblique
- DejaVuSansMono
	- Bold
	- BoldOblique
	- Oblique
- DejaVuSerif
	- Bold
	- BoldItalic
	- Italic
- DejaVuSerifCondensed
	- Bold
	- BoldItalic
	- Italic

It is possible to omit the style to get the regular version of the font (not bold, not oblique/italic).

```javascript
var wrappr = new WordWrappr(WordWrappr.getDejaVuPath("DejaVuSansMono"));
```

### Compute String Width

You can compute the width of a string of text as rendered in your font.

```javascript
var width = wrappr.computeWidth("Lorem ipsum dolor sit amet", 12);  // Font size 12
console.log(width);  // => 165.3046875
```

### Whitespace Handling

The wrapping algorithm used in this module will break lines of text at points matching the regular expression `/\s+/`.

Within sections of whitespace, strings of newline characters (matching the regular expression `/[\r\n]+/`) are replaced with a single space character.  This allows text that is already hard-wrapped to be re-wrapped by this module.  All other whitespace characters that are not involved in a line break are always preserved.  For example,

	Lorem   ipsum   dolor\nsit

(with three spaces between each of the words and a newline character near the end) could wrap to

	["Lorem   ipsum", "dolor sit"]

When a line is broken, all whitespace characters are removed from before and after the break.

## License

The MIT License

> Copyright (c) 2016 Shane F. Carr
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
