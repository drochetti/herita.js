
Class.extend('BaseClass', {

	Private : {

		somePrivateAttribute : 'private attr',

		somePrivateFunction : function () { }

	},

	Public : {

		getPrivateAttribute : function () {
			return this.somePrivateAttribute;
		},

		setPrivateAttribute : function (value) {
			this.somePrivateAttribute = value;
		},

		somePublicAttribute : 'public attr',

		somePublicFunction : function () { }

	}

});