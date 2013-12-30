var assert = require('assert'),
	should = require('should'),
	Module = require('../lib/Module');

describe('Module', function() {
	// Constructor tests
	describe('(name)', function() {
		it('should construct without dependencies', function() {
			var name = 'my-module',
				module = new Module(name);

			module.name.should.be.exactly(name);
			module.dependencies.should.be.empty;
			module.providers.should.be.empty;
			module.runBlocks.should.be.empty;
		});
		it('should construct with dependencies', function() {
			var name = 'my-module',
				dependencies = ['dep-1', 'dep-1'],
				module = new Module(name, dependencies);

			module.name.should.be.exactly(name);
			module.dependencies.should.be.exactly(dependencies);
			module.providers.should.be.empty;
			module.runBlocks.should.be.empty;
		});
	});

	// Constant tests
	describe('constant(key, value)', function() {
		var moduleName = 'my-module',
			module = new Module(moduleName);

		it('should register the constant', function() {
			var name = 'constant-1',
				value = 123;
			var result = module.constant(name, value);
			result.should.be.exactly(module);
			module.providers.should.includeEql([name, 'constant', value]);
		});

		it('should register the second constant', function() {
			var name = 'constant-2',
				value = {};
			module.constant(name, value);
			module.providers.should.includeEql([name, 'constant', value]);
		});
	});

	// Type tests
	describe('type(key, constructor)', function() {
		var moduleName = 'my-module',
			module = new Module(moduleName);
		var Type = function() {
		};

		it('should register the type', function() {
			var name = 'type-1',
				value = Type;
			var result = module.type(name, value);
			result.should.be.exactly(module);
			module.providers.should.includeEql([name, 'type', value]);
		});

		it('should register the second type', function() {
			var name = 'type-2',
				value = Type;
			module.type(name, value);
			module.providers.should.includeEql([name, 'type', value]);
		});
	});

	// Factory tests
	describe('factory(key, constructor)', function() {
		var moduleName = 'my-module',
			module = new Module(moduleName);
		var factoryMethod = function() {
		};

		it('should register the factory', function() {
			var name = 'factory-1',
				value = factoryMethod;
			var result = module.factory(name, value);
			result.should.be.exactly(module);
			module.providers.should.includeEql([name, 'factory', value]);
		});

		it('should register the second factory', function() {
			var name = 'factory-2',
				value = factoryMethod;
			module.factory(name, value);
			module.providers.should.includeEql([name, 'factory', value]);
		});
	});

	// Factory tests
	describe('decorater(key, constructor)', function() {
		var moduleName = 'my-module',
			module = new Module(moduleName);
		var decorateMethod = function() {
		};

		it('should register the decorator', function() {
			var name = 'decorator-1',
				value = decorateMethod;
			var result = module.decorator(name, value);
			result.should.be.exactly(module);
			module.providers.should.includeEql([name, 'decorator', value]);
		});

		it('should register the second decorator', function() {
			var name = 'decorator-2',
				value = decorateMethod;
			module.decorator(name, value);
			module.providers.should.includeEql([name, 'decorator', value]);
		});
	});

	// Run tests
	describe('run(callback)', function() {
		var moduleName = 'my-module',
			module = new Module(moduleName);
		var callbackMethod = function() {
		};

		it('should register the run callback', function() {
			var result = module.run(callbackMethod);
			result.should.be.exactly(module);
			module.runBlocks.should.includeEql(callbackMethod);
		});
	});
});
