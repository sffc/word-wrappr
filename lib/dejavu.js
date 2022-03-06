"use strict";

const path = require("path");

// Examples:
//    getPath("DejaVuSans", "Bold") => "/path/to/DejaVuSans-Bold.ttf"
//    getPath("DejaVuSerifCondensed", "BoldItalic") => "/path/to/DejaVuSerifCondensed-BoldItalic.ttf"
//    getPath("DejaVuSansMono", "Oblique") => "/path/to/DejaVuSansMono-Oblique.ttf"
function getDejaVuPath(face, style) {
	return path.join(
		__dirname,
		"..",
		"dejavu-fonts-ttf-2.37",
		"ttf",
		style ? face + "-" + style + ".ttf" : face + ".ttf"
	);
}

module.exports = getDejaVuPath;
