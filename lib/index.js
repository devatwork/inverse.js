/*jslint node: true */
"use strict";

var Injector = require('./Injector'),
	Module = require('./Module');

/**
 * Export the public API of the IoC module.
 */
module.exports = {
	Injector: Injector,
	Module: Module
};
