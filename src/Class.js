
(function (global) {

	if (!Array.isArray) {
		throw new Error('JS Enviroment not supported! EcmaScript 5 or later is required.');
	}

	/**
	 * Base Class. Encapsulaes JS prototypal inheritance using some common and well-known OO concepts.
	 * Inspired by John Resig "Simple Javascript Inheritance" post at
	 * <a href="http://ejohn.org/blog/simple-javascript-inheritance" target="_blank">
	 * http://ejohn.org/blog/simple-javascript-inheritance/</a>
	 * 
	 * <pre class="prettyprint linenums languague-js">
	 *	Class.extend('Namespace.SomeClass',{
	 *		Public : {
	 *			publicFunction : function() {
	 *				console.log('Hey, I\'m a public function!');
	 *			}
	 *		}
	 *	});
	 * </pre>
	 * 
	 * @class Class
	 * @abstract
	 * @author Daniel Rochetti
	 * @see #extend
	 */
	var Class = function () {};

	/**
	 * Defines a new class. All public members will be inherited... TODO complete doc
	 * @memberof Class
	 * @public
	 * @static
	 * @param {String} className Full qualified (namespace) class name.
	 * @param {Object} metadata Class member definitions.
	 * @returns {Class} A new <code>Class</code> definition.
	 * 
	 * @property {Function} metadata.init Define the function o be called during construction (new).
	 * @property {Array<Interface>} metadata.Implements TODO
	 * @property {Array<Aspect>} metadata.AdvisedBy TODO
	 * @property {Object} metadata.Static Define static attributes and functions for the <code>Class</code>
	 * @property {Object} metadata.Private Define private attributes and functions for the <code>Class</code>
	 * @property {Object} metadata.Public Define public attributes and functions for the <code>Class</code>
	 */
	Class.extend = function (className, metadata) {

		var objectId = 0;
		var superPrototype = this.prototype;
		var initializing = false;
		var thisPrototype = new this();
		initializing = true;

		/**
		 * Create namespace objects based on a <code>String</code> representation of it.
		 * @method createNamespace
		 * @memberof Class
		 * @private
		 * @param {String} ns Namespace declaration
		 * @returns {Object} top level namespace object reference
		 */
		var createNamespace = function (ns, topLevel) {
			var levels = ns.split('.');
			var first = levels.shift();
			var top = topLevel[first] = topLevel[first] || {};
			var lastLevel = top;
			if (levels.length) {
				lastLevel = createNamespace(levels.join('.'), top);
			}
			return lastLevel;
		};

		/**
		 * Checks if the property was defined in the object itself.
		 * @method getOwnProperty
		 * @memberof Class
		 * @private
		 * @param {Object} obj The object reference.
		 * @param {Object} name The name of the property.
		 * @returns {Any} the property reference that was defined in the object.
		 * It'll return <code>undefined</code> if it was defined elsewhere.
		 */
		var getOwnProperty = function (obj, name) {
			return Object.prototype.hasOwnProperty.call(obj, name) ? obj[name] : undefined;
		};

		/**
		 * It mixes two objects properties.
		 * Usually called <code>extend</code> by frameworks like <code>jQuery</code> and <code>Underscore</code>,
		 * it was renamed to avoid missinterpretation with the inheritance function <code>Class.extend</code>.
		 * @memberof Class
		 * @method mergeProperties
		 * @private
		 * @param {Object} target
		 * @param {Object} source
		 * @returns {Object} return the modified <code>target</code> object.
		 */
		var mergeProperties = function (target, source, filter) {
			for (var p in source) {
				if (source.hasOwnProperty(p) && (!filter || filter.call(this, source, p, source[p]))) {
					target[p] = source[p];
				}
			}
			return target;
		};

		/**
		 * The opposite of <code>mergeProperties</code>, it removes properties from the target that are also
		 * present on the source.
		 * @memberof Class
		 * @method removeProperties
		 * @private
		 * @param {Object} target
		 * @param {Object} source
		 * @param {Boolean} copyBeforeRemove
		 * @returns {Object} return the modified <code>target</code> object.
		 */
		var removeProperties = function (target, source, copyBeforeRemove) {
			for (var p in source) {
				if (target.hasOwnProperty(p)) {
					if (copyBeforeRemove) {
						source[p] = target[p];
					}
					delete target[p];
				}
			}
			return target;
		};

		/**
		 * Generates a string representation of the property. Mainly used by <code>Class.toString</code>.
		 * @private
		 * @param {Object} name The name of the property.
		 * @param {Object} value The value of the property.
		 * @returns {String} a representation of the named property.
		 */
		var propertyToString = function (name, value) {
			var isOverriden = !!superPrototype[name];
			return name + ' : ' + (value ? typeof value : 'unknown type') + (isOverriden ? ' [overrides]' : '');
		};

		/**
		 * @private
		 * @returns {String}
		 */
		var classToString = function () {
			var classToString = className + ' {';
			//classToString += '\n\tExtends : ' + this['getClassName'] ? this.getClassName() : 'Class';
			classToString += '\n\tinit : constructor function [' + (metadata.init ? 'overrides' : 'inherited') + ']';
			var metadataProperties = ['Static', 'Private', 'Public'];
			for (var i = 0; i < metadataProperties.length; i++) {
				var item = metadataProperties[i];
				classToString += '\n\t' + item + ' {';
				var obj = metadata[item];
				for (var p in obj) {
					if (obj.hasOwnProperty(p)) {
						classToString += '\n\t\t' + propertyToString(p, obj[p]);
					}
				}
				classToString += '\n\t}';
			}
			classToString += '\n}';
			return classToString;
		};
		var toString = classToString();

		var interfaces = metadata.Implements || [];
		interfaces = Array.isArray(interfaces) ? interfaces : [interfaces];
		var RESERVED_FUNCTIONS = ['constructor', 'init', 'getType', 'isInstanceOf', 'toString'];
		interfaces.forEach(function (mixinInterface) {
			mergeProperties(thisPrototype, mixinInterface.prototype, function (obj, name, value) {
				return RESERVED_FUNCTIONS.indexOf(name) === -1;
			});
		});

		// constructor function (init)
		superPrototype.init = superPrototype.init || function (attributes) {
			mergeProperties(this, attributes || {});
		};

		// prepare public members to bind to Class prototype
		var privateName = '__private__';
		var publicProperties = metadata.Public || {};
		publicProperties.init = metadata.init;

		/**
		 * TODO doc
		 * @memberof Class
		 * @private
		 * @param {Function} func the original function.
		 * @param {Function} superFunc the reference to the overridden function (may be `null`).
		 * @returns {Function}
		 */
		var functionInvoker = function (func, superFunc) {
			var invoker = function () {
				var callSuper = this.callSuper;
				this.callSuper = superFunc;
				var privateScope = mergeProperties({}, this[privateName]);
				mergeProperties(this, privateScope);
				var result = func.apply(this, arguments);
				removeProperties(this, privateScope, true);
				this[privateName] = privateScope;
				this.callSuper = callSuper;
				return result;
			};
			invoker.toString = function() {
				return func.toString();
			};
			return invoker;
		};

		for (var name in publicProperties) {
			var value = getOwnProperty(publicProperties, name);
			if (value && name !== privateName) {
				thisPrototype[name] = value;
				if (typeof publicProperties[name] === 'function') {
					thisPrototype[name] = functionInvoker(value, superPrototype[name]);
				}
			}
		}

		// binding, mixing and storing private members in __private__
		var privateMembers = mergeProperties({}, superPrototype[privateName] || {});
		privateMembers = mergeProperties(privateMembers, metadata.Private || {});
		//thisPrototype[privateName] = mergeProperties({}, privateMembers);
		thisPrototype[privateName] = privateMembers;

		// the 'real' constructor function
		var ClassInstance = function () {
			if (initializing) {
				objectId++;
				//this[privateName] = mergeProperties({}, privateMembers);
				thisPrototype.init.apply(this, arguments);
			}
		};

		// copy/inherit static properties
		mergeProperties(ClassInstance, this);
		mergeProperties(ClassInstance, metadata.Static || {});

		ClassInstance.toString = function () {
			return toString;
		};

		/**
		 * Get the full qualified name of the <code>Class</code>
		 * @method getQualifiedName
		 * @memberof Class
		 * @returns {String} full qualified class name (namespace + class name)
		 */
		ClassInstance.getQualifiedName = function () {
			return className;
		};

		var lastDot = className.lastIndexOf('.');
		var simpleName = lastDot > -1 ? className.substring(lastDot + 1) : className;
		/**
		 * Get the name <code>Class</code> without the namespace.
		 * @method getName
		 * @memberof Class
		 * @returns {String} the simple class name (class name - namespace)
		 * @see #getQualifiedName
		 */
		ClassInstance.getName = function () {
			return simpleName;
		};

		var namespace = lastDot > -1 ? className.substring(0, lastDot) : '';
		/**
		 * Get the namespace part of the full qualified class name.
		 * @method getNamespace
		 * @memberof Class
		 * @returns {String} The namespace or '' if class defined on root.
		 * @see #getQualifiedName
		 */
		ClassInstance.getNamespace = function () {
			return namespace;
		};

		/**
		 * Get the metadata object used to build this <code>Class</code>.
		 * @method getMeta
		 * @memberof Class
		 * @returns {Object} The original metadata object passed as an argument to build this <code>Class</code>
		 */
		ClassInstance.getMeta = function () {
			return metadata;
		};

		/**
		 * Get the type `Class` of this instance.
		 * @method getType
		 * @memberof Class
		 * @instance
		 * @returns {Class} the reference to the type definition (Class, Interface
		 * or Aspect constructor function reference).
		 */
		thisPrototype.getType = function () {
			return ClassInstance;
		};

		/**
		 * TODO
		 */
		thisPrototype.toString = function () {
			return this.getType().getQualifiedName() + '#instance#' + objectId;
		};

		/**
		 * Checks if the type is an instance of this Class instance.
		 * @method isInstanceOf
		 * @memberof Class
		 * @instance
		 * @param {Class} type The type to check against.
		 * @returns {Boolean} <code>true</code> if <code>this</code> is an instance of
		 * the specified type, <code>false</code> otherwise.
		 */
		thisPrototype.isInstanceOf = function (type) {
			var thisType = this.getType();
			var isInstance = thisType === type || this instanceof type;
			if (!isInstance) {
				var interfaces = thisType.interfaces || [];
				for (var i = 0; i < interfaces.length; i++) {
					if (interfaces[i] === type || interfaces[i] instanceof type) {
						isInstance = true;
						break;
					}
				}
			}
			return isInstance;
		};

		ClassInstance.prototype = thisPrototype;
		ClassInstance.prototype.constructor = ClassInstance;
		ClassInstance.extend = arguments.callee;
		ClassInstance.interfaces = interfaces.concat(this.interfaces || []);

		// apply Aspects
		var aspects = metadata.AdvisedBy || [];
		aspects = Array.isArray(aspects) ? aspects : [aspects];
		for (var i = 0; i < aspects.length; i++) {
			aspects[i].applyTo(ClassInstance);
		}

		var exportTo = namespace ? createNamespace(namespace, global) : global;
		exportTo[simpleName] = ClassInstance;
		return ClassInstance;

	};

	global.Class = Class;

})(this);
