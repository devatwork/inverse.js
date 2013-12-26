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
 * @param   {String} key   The identifier of this constant.
 * @param   {Object} value The constant value.
 * @returns {Module}       The module for chaining.
 */
Module.prototype.constant = function(key, value) {
	this.providers.push([key, 'constant', value]);
    return this;
};

/**
 * Register a **type service**, which will be invoked with `new` to create the service instance.
 * @param   {string}   key         The identifier of this type.
 * @param   {Function} constructor A class (constructor function) that will be instantiated.
 * @returns {Module}               The module for chaining.
 */
Module.prototype.type = function(key, constructor) {
	this.providers.push([key, 'type', constructor]);
    return this;
};

/**
 * Register a **service factory**, which will be called to return the service instance.
 * @param   {string}     key       The identifier of this factory.
 * @param   {Function}   factoryFn The factory method for the instance creation.
 * @returns {Module}               The module for chaining.
 */
Module.prototype.factory = function(key, factoryFn) {
	this.providers.push([key, 'factory', factoryFn]);
    return this;
};

/**
 * Register a service decorator. A service decorator intercepts the creation of a service, allowing it to override or modify the behaviour of the service. The object returned by the decorator may be the original service, or a new service object which replaces or wraps and delegates to the original service.
 * @param   {string}     key        The name of the service to decorate.
 * @param   {Function}   decorateFn This function will be invoked when the service needs to be instantiated and should return the decorated service instance.
 * @returns {Module}                The module for chaining.
 */
Module.prototype.decorator = function(key, decorateFn) {
	this.providers.push([key, 'decorator', decorateFn]);
    return this;
};

/**
 * Register a **run method**, which will be called just after the module is completely initialized.
 * @param   {Function} runFn The function which to invoke.
 * @returns {Module}         The module for chaining.
 */
Module.prototype.run = function(runFn) {
	this.runBlocks.push(runFn);
    return this;
};

/**
 * Exports the {Module} contructor.
 */
module.exports = Module;
