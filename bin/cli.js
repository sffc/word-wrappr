#!/usr/bin/env node

const async = require("async");
const commandLineArgs = require("command-line-args");
const getUsage = require("command-line-usage");
const WordWrappr = require("..");

// Parse command line options
const optionDefinitions = [
	{ name: "font-size", alias: "s", type: Number, defaultValue: 12, description: "The font size to use when calculating text width.  Default: 12" },
	{ name: "width", alias: "w", type: Number, defaultValue: 100, description: "The maximum line width, in the same unit as the font size.  Default: 100" },
	{ name: "ttf", type: String, typeLabel: "[underline]{file}", description: "A font to use instead of the default, DejaVu Sans. TTF and OTF are supported." },
	{ name: "help", type: Boolean, description: "Print this usage guide." },
];
const options = commandLineArgs(optionDefinitions);

// Make usage text
const sections = [
	{
		header: "Word Wrappr",
		content: "Wraps text from stdin according to its rendered font width."
	},
	{
		header: "Synopsis",
		content: [
			"$ wrappr [[bold]{--ttf} [underline]{file}] [bold]{-s} [underline]{font size} [bold]{-w} [underline]{width} < [underline]{input.txt}",
			"$ wrappr [bold]{--help}"
		]
	},
	{
		header: "Options",
		optionList: optionDefinitions
	}
];
const usage = getUsage(sections);

if (options.help) {
	process.stdout.write(usage);
	process.exit(0);
}

// Perform the task
async.auto({
	// Read from STDIN
	"stdin": (next) => {
		var chunks = [];
		process.stdin.on("data", (chunk) => chunks.push(chunk));
		process.stdin.on("end", () => {
			next(null, Buffer.concat(chunks).toString("utf-8"));
		});
		process.stdin.on("error", next);
	},

	// Load from resource file
	"load": (next) => {
		var wrappr = new WordWrappr(options["ttf"]);
		wrappr.load((err) => {
			next(err, wrappr);
		});
	},

	// Print output when both of the other two tasks are complete
	"results": ["stdin", "load", (results, next) => {
		var text = results.stdin;
		var wrappr = results.load;
		var lines = wrappr.wrap(text, options["font-size"], options["width"]);
		process.stdout.write(lines.join("\n"));
		next(null);
	}]
}, (err) => {
	// CLI file: console OK.
	console.error(err); // eslint-disable-line no-console
	process.exit(err ? 1 : 0);
});
