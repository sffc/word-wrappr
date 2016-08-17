"use strict";

const WordWrappr = require("./lib/wrappr");
const getDejaVuPath = require("./lib/dejavu");

WordWrappr.getDejaVuPath = getDejaVuPath;
module.exports = WordWrappr;
