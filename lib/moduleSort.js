/*jslint node: true */
"use strict";

/**
 * Performs a topological sort of the modules.
 * @param  {Array.<Module>} graph The modules which to sort.
 * @return {Array.<Module>}       The sorted modules.
 */
module.exports = function(modules, parentModules) {
	modules = modules || [];
	parentModules = parentModules || [];
	var marks = {},
		mark,
		i,
		module,
		sorted = [],
		map = {};

	for (i = 0; i < parentModules.length; i++) {
		module = parentModules[i];
		marks[module.name] = 'resolved';
	}

	for (i = 0; i < modules.length; i++) {
		module = modules[i];
		map[module.name] = module;
	}

	for (i = 0; i < modules.length; i++) {
		module = modules[i];
		if (!marks[module.name]) {
			visit(module.name);
		}
	}

	function visit(name) {
		mark = marks[name];
		if (mark === 'resolving') {
			throw new Error('There is a cycle in the graph. It is not possible to derive a topological sort!');
		} else if (mark) {
			return;
		}
		var module = map[name];
		if (!module) {
			throw new Error('Module "' + name + '" could not be found!');
		}

		marks[name] = 'resolving';
		module.dependencies.forEach(visit);
		marks[name] = 'resolved';
		sorted.push(module);
	}

	return sorted;
};
