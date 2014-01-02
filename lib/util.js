/*jslint node: true */
"use strict";

/**
 * Exports several utility methods.
 * @type {Object}
 */
module.exports = {
	/**
	 * Checks if `value` is an array.
	 * @param   {*}       value The value to check.
	 * @returns {boolean}       Returns `true` if the `value` is an array, else `false`.
	 */
	isArray: function(value) {
		return Array.isArray(value);
	},
	/**
	 * Checks if `value` is a function.
	 * @param   {*}       value The value to check.
	 * @returns {boolean}       Returns `true` if the `value` is a function, else `false`.
	 */
	isFunction: function(value) {
		return typeof value === 'function';
	},
	/**
	 * Checks if `value` is a string.
	 * @param   {*}       value The value to check.
	 * @returns {boolean}       Returns `true` if the `value` is a string, else `false`.
	 */
	isString: function(value) {
		return typeof value === 'string';
	}
};
