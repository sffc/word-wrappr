const WordWrappr = require(".");

var wrappr = new WordWrappr();
wrappr.loadSync();
var lines = wrappr.wrap("Lorem ipsum dolor sit amet", 12, 100);
console.log(lines);

var width = wrappr.computeWidth("Lorem ipsum dolor sit amet", 12);  // Font size 12
console.log(width);  // => 165.3046875
