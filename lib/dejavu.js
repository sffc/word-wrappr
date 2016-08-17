"use strict";

const dejavu = require("dejavu-fonts-ttf");

// Examples:
//    getPath("DejaVuSans", "Bold") => "/path/to/DejaVuSans-Bold.ttf"
//    getPath("DejaVuSerifCondensed", "BoldItalic") => "/path/to/DejaVuSerifCondensed-BoldItalic.ttf"
//    getPath("DejaVuSansMono", "Oblique") => "/path/to/DejaVuSansMono-Oblique.ttf"
function getDejaVuPath(face, style) {
	return dejavu.getPathToTTF(face, style);
}

module.exports = getDejaVuPath;
