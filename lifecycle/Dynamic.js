/**
 * @license Copyright (c) 2011 Cello Software, LLC.
 * All rights reserved.
 * Available via the new BSD License.
 */
/*jshint
	asi: false, bitwise: false, boss: false, curly: true, eqeqeq: true, eqnull: false, es5: true,
	evil: false, expr: true, forin: true, globalstrict: false, immed: true, indent: 4, latedef: true,
	laxbreak: false, loopfunc: true, maxlen: 100, newcap: true, noarg: true, noempty: true,
	nonew: true, nomen: false, onevar: true, passfail: false, plusplus: false, shadow: false,
	strict: false, sub: false, trailing: true, undef: true, white: true
*/
/*global define: false, require: false*/

define([
	'../support/array',
	'../support/compose',
	'../support/promise'
], function (arr, compose, promise) {
	'use strict';

	function Dynamic(model) {
		this.model = model;
		this._instances = [];
	}

	return compose(Dynamic, {
		resolve: function (args) {
			var instances = this._instances,
				model = this.model;

			// always construct a new instance
			return promise.when(this.model.construct(args), function (instance) {
				return promise.when(model.commission(instance), function (instance) {
					instances.push(instance);
					return instance;
				});
			});
		},

		release: function (instance) {
			var instances = this._instances,
				index = arr.indexOf(instances, instance);

			if (~index) {
				instances.splice(index, 1);
				this.model.decommission(instance);
				this.model.deconstruct(instance);
			}
		},
		destroy: function () {
			arr.forEach(this._instances, function (instance) {
				this.release(instance);
			}, this);
		}
	});
});
