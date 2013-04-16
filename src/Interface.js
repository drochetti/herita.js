(function (global) {

	/**
	 * TODO docme
	 * @class Interface
	 * @extends Class
	 * @abstract
	 */
	var Interface = function () {};
	/**
	 * TODO docme
	 * @memberof Interface
	 * @param {String} name TODO
	 * @param {Object} members TODO
	 */
	Interface.extend = function (name, members) {
		return Class.extend.call(this, name, {
			init : function() {
				throw new Error('[' + this.getType().getQualifiedName() + '] Interfaces cannot be directly instantiated!');
			},
			Public : members
		});
	};

	global.Interface = Interface;

})(this);