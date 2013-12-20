/*jslint node: true */
"use strict";

/**
 * Holds the information of an application module.
 */
var Module = function(name, dependencies) {
	this.name = name;
	this.dependencies = dependencies || [];
	this.providers = [];
	this.runBlocks = [];
};

/**
 * Register a **constant service**, such as a string, a number, an array, an object or a function,
 * with the {Module}.
 * @param   {String} name  The name of the constant.
 * @param   {Object} value The constant value.
 * @returns {Module}       The module for chaining.
 */
Module.prototype.constant = function(name, value) {
	this.providers.push([name, 'constant', value]);
    return this;
};

/**
 * Register a **type service**, which will be invoked with `new` to create the service instance.
 * @param   {string}   name        The name of the instance.
 * @param   {Function} constructor A class (constructor function) that will be instantiated.
 * @returns {Module}               The module for chaining.
 */
Module.prototype.type = function(name, constructor) {
	this.providers.push([name, 'type', constructor]);
    return this;
};

/**
 * Register a **service factory**, which will be called to return the service instance.
 * @param   {string}     name    The name of the instance.
 * @param   {Function}   factory The factory method for the instance creation.
 * @returns {Module}             The module for chaining.
 */
Module.prototype.factory = function(name, factory) {
	this.providers.push([name, 'factory', factory]);
    return this;
};

/**
 * Register a **run method**, which will be called just after the module is completely initialized.
 * @param   {Function} callback The function which to invoke.
 * @returns {Module}            The module for chaining.
 */
Module.prototype.run = function(callback) {
	this.runBlocks.push(callback);
    return this;
};

/**
 * Exports the {Module} contructor.
 */
module.exports = Module;
