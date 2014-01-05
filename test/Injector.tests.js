var assert = require('assert'),
	should = require('should'),
	Module = require('../lib/Module'),
	Injector = require('../lib/Injector');

describe('Injector', function() {
	// Constructor tests
	describe('()', function() {
		it('should start if there are no modules', function() {
			new Injector();
		});

		it('should start if there is one module without dependencies', function() {
			var modA = new Module('mod-a');
			new Injector([modA]);
		});

		it('should start if one of module has missing dependencies', function() {
			var modA = new Module('mod-a', ['mod-b']);
			(function(){
				new Injector([modA]);
			}).should.throw('Module "mod-b" could not be found!');
		});

		it('should start if all depedencies are satisfied', function() {
			var modA = new Module('mod-a', []);
			var modB = new Module('mod-b', ['mod-a']);
			new Injector([modA, modB]);
		});

		it('should start if a dependency is registered on the parent injector', function() {
			var modA = new Module('mod-a', ['mod-b']),
				modB = new Module('mod-b'),
				parent = new Injector([modB]);
			new Injector([modA], parent);
		});

		it('should register the injector into itself', function() {
			var injector = new Injector();
			injector.get('$injector').should.be.exactly(injector);
		});
	});

	// Invoke tests
	describe('invoke(fn, self)', function() {
		var expectedConstant = 'check',
			module = new Module('mod').constant('constant', expectedConstant),
			injector = new Injector([module]),
			invoked,
			actualConstant,
			expectedScope = {scoped: true},
			actualScope,
			retVal = {returned: true};

		it('should invoke unannotated functions', function() {
			var func1 = function(constant) {
					invoked = true;
					actualConstant = constant;
					return retVal;
				};
			injector.invoke(func1).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
		});

		it('should invoke annotated functions', function() {
			var func1 = function(param) {
					invoked = true;
					actualConstant = param;
					return retVal;
				};
			func1.$inject = ['constant'];
			injector.invoke(func1).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
		});

		it('should invoke array annotated functions', function() {
			var func1 = function(param) {
					invoked = true;
					actualConstant = param;
					return retVal;
				};
			injector.invoke(['constant', func1]).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
		});

		it('should invoke unannotated functions with self', function() {
			var func1 = function(constant) {
					invoked = true;
					actualConstant = constant;
					actualScope = this;
					return retVal;
				};
			injector.invoke(func1, expectedScope).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
			actualScope.should.be.exactly(expectedScope);
		});

		it('should invoke annotated functions with self', function() {
			var func1 = function(param) {
					invoked = true;
					actualConstant = param;
					actualScope = this;
					return retVal;
				};
			func1.$inject = ['constant'];
			injector.invoke(func1, expectedScope).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
			actualScope.should.be.exactly(expectedScope);
		});

		it('should invoke array annotated functions with self', function() {
			var func1 = function(param) {
					invoked = true;
					actualConstant = param;
					actualScope = this;
					return retVal;
				};
			injector.invoke(['constant', func1], expectedScope).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
			actualScope.should.be.exactly(expectedScope);
		});

		it('should invoke array annotated functions with locals', function() {
			var expectedLocal = 132456798,
				actualLocal,
				func1 = function(param, local) {
					invoked = true;
					actualConstant = param;
					actualScope = this;
					actualLocal = expectedLocal
					return retVal;
				};
			injector.invoke(['constant', 'local1', func1], expectedScope, {local1: expectedLocal}).should.be.exactly(retVal);
			invoked.should.be.true;
			actualConstant.should.be.exactly(expectedConstant);
			actualScope.should.be.exactly(expectedScope);
			expectedLocal.should.be.exactly(actualLocal);
		});
	});

	// Instantiate tests
	describe('annotate(fn)', function() {
		var injector = new Injector();
		
		it('should no annotate if the function is already annotated', function() {
			var fn = function(injected) {};
			fn.$inject = ['test'];
			injector.annotate(fn).should.be.exactly(fn.$inject);
		});

		it('should annotate the function if not already annotated', function() {
			var fn = function(test) {};
			injector.annotate(fn).should.be.eql(['test']);
		});

		it('should annotate the function if using array syntax', function() {
			var fn = function(injected) {};
			injector.annotate(['test', fn]).should.be.eql(['test']);
		});

		it('should not be able to annotate objects', function() {
			var fn = function(injected) {};
			(function(){
				injector.annotate({});
			}).should.throw('Cannot annotate "[object Object]"');
		});
	});

	// Instantiate tests
	describe('instantiate(Type)', function() {
		var TestType1 = function() {
		};
		var TestType2 = function(injected) {
		};
		TestType2.$inject = ['injected'];
		var TestType3 = function(local) {
		};
		var module = new Module().constant('injected', true).type('TestType3', TestType3),
			injector = new Injector([module]);

		it('should be able to instantiate a parameterless class', function() {
			injector.instantiate(TestType1).should.be.an.instanceOf(TestType1);
		});

		it('should be able to instantiate a class with an injecter parameter', function() {
			injector.instantiate(TestType2).should.be.an.instanceOf(TestType2);
		});

		it('should be able to instantiate a class annotated with array syntax', function() {
			injector.instantiate(['injected', TestType1]).should.be.an.instanceOf(TestType1);
		});

		it('should be able to instantiate a class with a local', function() {
			injector.instantiate(TestType3, {local: 'injected!'}).should.be.an.instanceOf(TestType3);
		});

		it('should be able to instantiate a type by its name', function() {
			injector.instantiate('TestType3', {local: 'injected!'}).should.be.an.instanceOf(TestType3);
		});
	});

	// Get tests
	describe('get(name)', function() {
		var TestType1 = function() {
		};
		var TestType2 = function() {
		};
		var TestType3 = function() {
		};
		TestType3.$inject = ['type3'];
		var constant1 = 'test-1-value',
			modA = new Module('mod-a')
				.constant('constant1', constant1)
				.type('type1', TestType1)
				.type('type3', TestType3)
				.factory('factory1', function() {
					return new TestType1();
				}),
			constant2 = 'test-2-value',
			modB = new Module('mod-b')
				.constant('constant2', constant2)
				.type('type2', TestType2)
				.factory('factory2', function() {
					return new TestType2();
				})
				.constant('decoratedConstant', constant1)
				.decorator('decoratedConstant', ['$delegate', 'constant2', function($delegate, constant2) {
					return $delegate + constant2;
				}])
				.type('decoratedType', TestType2)
				.decorator('decoratedType', ['$delegate', function($delegate) {
					$delegate.decorated = true;
					return $delegate;
				}])
				.factory('decoratedFactory', function() {
					return new TestType2();
				})
				.decorator('decoratedFactory', ['$delegate', function($delegate) {
					$delegate.decorated = true;
					return $delegate;
				}])
				.type('nonReturningMonkeyPatcher', TestType2)
				.decorator('nonReturningMonkeyPatcher', ['$delegate', function($delegate) {
					$delegate.monkeyed = true;
				}])
				.type('doubleDecorated', TestType2)
				.decorator('doubleDecorated', ['$delegate', function($delegate) {
					$delegate.first = true;
					return $delegate;
				}])
				.decorator('doubleDecorated', ['$delegate', function($delegate) {
					$delegate.second = true;
					return $delegate;
				}]),
			parent = new Injector([modB]),
			injector = new Injector([modA], parent);

		it('should not resolve undeclared dependencies', function() {
			(function() {
				return injector.get('not-declared');
			}).should.throw('No provider for "not-declared"!');
		});

		it('should resolve declared constants', function() {
			injector.get('constant1').should.be.exactly(constant1);
		});

		it('should resolve declared constants in parent', function() {
			injector.get('constant2').should.be.exactly(constant2);
		});

		it('should resolve declared types', function() {
			injector.get('type1').should.be.an.instanceOf(TestType1);
		});

		it('should resolve declared types in parent', function() {
			injector.get('type2').should.be.an.instanceOf(TestType2);
		});

		it('should resolve declared factories', function() {
			injector.get('factory1').should.be.an.instanceOf(TestType1);
		});

		it('should resolve declared factories in parent', function() {
			injector.get('factory2').should.be.an.instanceOf(TestType2);
		});

		it('should not resolve circular dependencies', function() {
			(function() {
				return injector.get('type3');
			}).should.throw('Can not resolve circular dependency!');
		});

		it('should resolve decorated constants', function() {
			injector.get('decoratedConstant').should.be.eql(constant1 + constant2);
		});

		it('should resolve decorated types', function() {
			injector.get('decoratedType').decorated.should.be.true;
		});

		it('should resolve decorated factories', function() {
			injector.get('decoratedFactory').decorated.should.be.true;
		});

		it('should resolve decorated decorators, yo dawg', function() {
			var t = injector.get('doubleDecorated');
			t.first.should.be.true;
			t.second.should.be.true;
		});

		it('should resolve if the decorator does not return a new value', function() {
			injector.get('nonReturningMonkeyPatcher').monkeyed.should.be.true;
		});
	});

	// Run callback tests
	describe('run callback', function() {
		it('should run all callback', function() {
			var parameterlessRunInvoked = false,
				parameterizedRunInvoked = false,
				arrayAnnotatedRunInvoked = false,
				module = new Module('module')
					.constant('constant', 'yes')
					.run(function() {parameterlessRunInvoked = true;})
					.run(function(constant) {parameterizedRunInvoked = true;})
					.run(['constant', function(injected) {arrayAnnotatedRunInvoked = true;}]),
				injector = new Injector([module]);
			parameterlessRunInvoked.should.be.true;
			parameterizedRunInvoked.should.be.true;
			arrayAnnotatedRunInvoked.should.be.true;
		});
	});

	// Run module load order tests
	describe('load modules in topological order', function() {
		var actualOrder,
			expectedOrder = ['a', 'b', 'c'],
			modA = new Module('a').run(function() {actualOrder.push('a');}),
			modB = new Module('b', ['a']).run(function() {actualOrder.push('b');}),
			modC = new Module('c', ['b']).run(function() {actualOrder.push('c');}),
			modD = new Module('d', ['missing']),
			modCircular = new Module('b', ['c']);

		it('should throw on missing dependency', function() {
			(function(){
				new Injector([modD]);
			}).should.throw('Module "missing" could not be found!');
		});

		it('should throw on circular dependency', function() {
			(function(){
				new Injector([modC, modCircular]);
			}).should.throw('There is a cycle in the graph. It is not possible to derive a topological sort!');
		});

		it('should load in order if in order', function() {
			actualOrder = [];
			new Injector([modA, modB, modC]);

			actualOrder.should.eql(expectedOrder);
		});

		it('should load in order if in reverse order', function() {
			actualOrder = [];
			new Injector([modC, modB, modA]);

			actualOrder.should.eql(expectedOrder);
		});

		it('should load in order if in mixed order', function() {
			actualOrder = [];
			new Injector([modA, modC, modB]);

			actualOrder.should.eql(expectedOrder);
		});
	});
});
