# Reverse.js [![Build Status](https://travis-ci.org/devatwork/reverse.js.png?branch=master)](https://travis-ci.org/devatwork/reverse.js)

A DI container inspired by the AngularJS.

## Why dependency injection?

Dependency injection is a software design pattern that allows the removal of hard-coded dependencies and makes it possible to change them, whether at run-time or compile-time.

This can be used, for example, as a simple way to load plugins dynamically or to choose stubs or mock objects in test environments vs. real objects in production environments. This software design pattern injects the depended-on element (object or value, etc.) to the destination automatically by knowing the requirement of the destination. Another pattern, called dependency lookup, is a regular process and reverse process to dependency injection.

One of its core principles is the separation of behavior from dependency resolution.

## Concepts

Reverse.js is heavily inspired by the *DI Container* as implemented in [AngularJS](http://angularjs.org/), it derives most of its concepts from it as well.

The main element is the DI container itself is called the *Injector*. Its goal is to resolve values from providers.

A *Provider* is either an object or a function. Providers are, together with their declared dependencies, registered in the injector and the values they provide can be requested from the injector. If a provider is requested the injector injects its dependencies before returning it.

Providers can be grouped into *Modules*. Modules get registered in the injector.

## Example

```js
var di = require('./reversejs');

// Define a Car object which needs an engine obviously
var Car = function(engine) {
	this.start = function() {
		engine.start();
	};
};

// Define a factory which can create different type of engines
var engineFactory = function(engineType) {
	return {
		start: function() {
			console.log('Starting ' + engineType + ' engine');
		}
	};
};

// Create the drive module
var carModule = new di.Module('driving');
carModule.type('car', Car);
carModule.factory('engine', engineFactory);
carModule.constant('engineType', 'rocket');

// Create the injector
var injector = new di.Injector([carModule]);

// Execute a function using the injector, the dependencies will be injected
injector.invoke(function(car) {
	car.start();
});
```

## Annotations

Annotations are the way to declare the dependencies of a provider. There are several ways to declare them.

### Array syntax

My personal favorite, clean syntax.

```js
module.run(['car', function(carInstance) {
	carInstance.start();
}]);
```

### Method arguments

Warning: this might break when used with minifiers.

```js
module.run(function(car) {
	car.start();
});
```

### $inject

Possibly the most clean way, since it seperates the concerns.

```js
var startCar = function(car) {
	car.start();
};
startCar.$inject = ['car'];
module.run(startCar);
```

## Module API

### constant(key, value)

Registers a constant value.

```js
module.constant('engineType', 'rocket');
```

### type(key, Constructor)

If resolved, the `Constructor` will be called with the `new` operator to create an instance.

```js
module.type('car', Car);
```

### factory(key, factoryFn)

If resolved, the `factoryFn` will be invoked to produce an instance.

```js
module.factory('engine', engineFactory);
```

### run(runFn)

Registers a `runFn` callback which will be invoked after the injector is initialized.

```js
module.run(function(car) {
	car.start(); // Lets get going!
});
```

## Injector API

### instantiate(Type, locals)

Instantiates the given `Type`, the construct arguments of the `Type` are injected. `Type` is either the constructor function or a string. If it is a string, it is assumed to be a registered type key, which is resolved first. `locals` is an optional object and if present then any argument names are read from this object first, before the $injector is consulted.

```js
var car1 = injector.instantiate(Car); // Creates an instance of the Car
var car2 = injector.instantiate('car'); // Resolves car type by key an instantiates it
```

### get(key)

Gets the value from the provider identified by key.

```js
var car = injector.get('car');
```

### invoke(fn, self, locals)

Invoke the method and supply the method arguments from this injector. `fn` is the function to invoke, its arguments are injected. `self` it the optional `this` binding of `fn`. `locals` is an optional object and if present then any argument names are read from this object first, before the $injector is consulted.

```js
injector.invoke(function(car) {
	car.start();
});
```

## Copyright

Copyright (c) 2013 Bert Willems and contributors.

## License

This project is licensed under [MIT](http://www.opensource.org/licenses/mit-license.php "Read more about the MIT license form"). Refer to LICENCE for more information.
