
(function(global) {

	var arrayUnion = function() {
		var union = [];
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			for (var j = 0; j < arg.length; j++) {
				var value = arg[j];
				if (union.indexOf(value) === -1) {
					union.push(value);
				}
			}
		}
		return union;
	};

	var jointpointExecuter = function(func, before, after) {
		var executer = function() {
			var result;
			if (before) {
				result = before.apply(this, arguments);
			}
			if (result !== false) {
				func.call(this, arguments);
				if (after) {
					after.call(this, arguments);
				}
			}
		};
		executer.toString = function() {
			return func.toString();
		};
		return executer;
	};

	var keys = Object.keys;

	/**
	 * TODO docme
	 * @class Aspect
	 * @extends Class
	 * @abstract
	 */
	var Aspect = function () {};

	/**
	 * TODO docme
	 * @memberof Aspect
	 * @stereotype Aspect
	 * @param {String} name TODO
	 * @param {Object} rules TODO
	 */
	Aspect.define = function (name, rules) {
		var aspect = Class.extend.call(this, name, {
			init : function() {
				throw new Error('[' + this.getType().getQualifiedName() + '] Aspects cannot be directly instantiated!');
			},
			Static : {
				applyTo : function(type) {
					var _that = type.prototype;
					var _this = this.prototype;
					var before = _this.Before;
					var after = _this.After;
					var functionNames = arrayUnion(keys(before), keys(after));
					for (var i = 0; i < functionNames.length; i++) {
						var name = functionNames[i];
						var currentFunction = _that[name];
						if (currentFunction && typeof currentFunction === 'function') {
							_that[name] = jointpointExecuter(currentFunction, before[name], after[name]);
						}
					}
				}
			},
			Public : {
				Before : rules.Before || {},
				After : rules.After || {}
			}
		});
		// Aspects has no inheritance model
		aspect.extend = aspect.define = function() {
			throw new Error('Aspects are not supposed to be inherited (no subclassing).');
		};
		return aspect;
	};

	global.Aspect = Aspect;


})(this);
