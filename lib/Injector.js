/*jslint node: true */
"use strict";

var _ = require('lodash');

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

/**
 * The injector constructs instances with their dependencies resolved. It can also call methods with dependencies.
 * @param {Array.<Module>} modules The modules which to load into this injector.
 * @param {Injector}       parent  The parent injector of this injector.
 */
var Injector = function(modules, parent) {
	// Set values
	this._modules = modules || [];
	this._parent = parent;

	// Create a parent if there is none, the created parent will throw errors if dependencies can not be resolved
	var injector = this;
	injector._parent = injector._parent || {
		getModule: function(name) {
			throw new Error('Module "' + name + '" could not be found!');
		},
		get: function(name) {
			throw new Error('No provider for "' + name + '"!');
		}
	};

	// Initialize caches
	this._currentlyResolving = [];
	this._providers = Object.create(injector._parent._providers || null);
	this._instances = Object.create(null);

	// Register the injector
	this._instances['$injector'] = injector;

	// Create the factory map
	var factoryMap = {
		constant: function(value) {
			return value;
		},
		factory: _.bind(injector.invoke, injector),
		type: _.bind(injector.instantiate, injector)
	};

	// Ensure all the module dependencies can be loaded
	var runBlocksQueue = [];
	injector._modules.forEach(function(module) {
		// Loop over each dependency and try to resolve it
		module.dependencies.forEach(injector.getModule, injector);

		// Register all the providers
		module.providers.forEach(function(provider) {
			// Get the provider details
			var name = provider[0],
				type = provider[1],
				value = provider[2];

			// Register the provider
			injector._providers[name] = [factoryMap[type], value, type];
		});

		// Add all the run blocks to the queue
		module.runBlocks.forEach(function(runBlock) {
			runBlocksQueue.push(runBlock);
		});
	});

	// Execute all the run blocks
	runBlocksQueue.forEach(function(runBlock) {
		injector.invoke(runBlock);
	});
};

/**
 * Gets the {Module} by its name.
 * @param  {String}  name The name of the module.
 * @return {Module}       Returns the module.
 */
Injector.prototype.getModule = function(name) {
	return _.find(this._modules, function(candidate) {
		return candidate.name === name;
	}) || this._parent.getModule(name);
};

/**
 * Gets the dependency annotations for the given function.
 * @param  {*}              fn   If a function the parameter names are used to determine the dependency keys, if an array it is considered array syntax.
 * @return {Array.<String>}      The keys of the dependencies which to inject.
 */
Injector.prototype.annotate = function(fn) {
	var $inject;

	// First check if the fn is indeed a function
	if (_.isFunction(fn)) {
		// Check if the function is not already annotated
		if (!($inject = fn.$inject)) {
			$inject = [];
			if (fn.length) {
				// Strip the comments from the function and get only the function arguments
				var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
					argDecl = fnText.match(FN_ARGS);

				// Loop over each argument
				argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg) {
					arg.replace(FN_ARG, function(all, underscore, name){
						$inject.push(name);
					});
				});
			}
		}

		// Cache the annotation on the function
		fn.$inject = $inject;
	} else if (_.isArray(fn)) {
		// The last argument is the actual function which to invoke, use the first parameters as injection annotations
		var last = fn.length - 1;
		$inject = fn.slice(0, last);
	} else {
		throw new Error('Cannot annotate "' + fn +'"');
	}

	return $inject;
};

/**
 * Instantiates the given Type, the construct parameters are injected.
 * @param  {Function} Type   The type which to instantiate.
 * @param  {Object=}  locals Optional object. If preset then any argument names are read from this object first, before the $injector is consulted.
 * @return {Object}          The instance of {Type}.
 */
Injector.prototype.instantiate = function(Type, locals) {
	var Constructor = function() {},
		instance,
		returnedValue;

	// If the Type is a string, resolve the provider and invoke it
	if (_.isString(Type)) {
		return this._providers[Type][0](this._providers[Type][1], locals);
	}

	// Check if Type is annotated with array syntax and use just the given function at n-1 as parameter
	if (_.isFunction(Type)) {
		Constructor.prototype = Type.prototype;
	} else if (_.isArray(Type)) {
		Constructor.prototype =  Type[Type.length - 1].prototype;
	} else {
		throw new Error('Dont know how to instantiate "' + Type + '"');
	}
	
	// Create the instance and invoke the constructor
	instance = new Constructor();
	returnedValue = this.invoke(Type, instance, locals);

	// Return the constructed value
	return typeof returnedValue === 'object' ? returnedValue : instance;
};

/**
 * Gets the value from the provider identified by name.
 * @param  {String} name The name of the provider from which to get the value.
 * @return {*}           The resolved value.
 */
Injector.prototype.get = function(name) {
	// Check if the dependency is already initialized
	if (Object.hasOwnProperty.call(this._instances, name)) {
		return this._instances[name];
	}

	// Check if this injector has a provider for the given dependency
	if (Object.hasOwnProperty.call(this._providers, name)) {
		if (this._currentlyResolving.indexOf(name) !== -1) {
			throw new Error('Can not resolve circular dependency!');
		}

		this._currentlyResolving.push(name);
		this._instances[name] = this._providers[name][0](this._providers[name][1]);
		this._currentlyResolving.pop();

		return this._instances[name];
	}

	// Try to load the dependency from the parent
	return this._parent.get(name);
};

/**
 * Invoke the method and supply the method arguments from this injector.
 * @param  {Function} fn     The function to invoke. Function parameters are injected.
 * @param  {Object=}  self   The `this` for the invoked method.
 * @param  {Object=}  locals Optional object. If preset then any argument names are read from this object first, before the $injector is consulted.
 * @return {*}               The value returned by the invoked `fn` function.
 */
Injector.prototype.invoke = function(fn, self, locals) {
	// Find the dependecies to inject and resolve them
	var injector = this,
		$inject = injector.annotate(fn),
		args = [];
	$inject.forEach(function(key) {
		// Make sure the key is a proper string
		if (typeof key !== 'string') {
			throw new Error('Incorrect injection token! Expected service name as string, got "' + key + '"');
		}

		// Resolve the dependency and add it to the arguments array
		args.push(locals && locals.hasOwnProperty(key) ? locals[key] : injector.get(key));
	});

	// If the function does not have a $inject property, it must mean the array syntax is used where the last parameter is the function to invoke
	if (!fn.$inject) {
		fn = fn[$inject.length];
	}

	// Execute the function and return the result
	return fn.apply(self, args);
};

/**
 * Exports the {Injector} contructor.
 */
module.exports = Injector;
