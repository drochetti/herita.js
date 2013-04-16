describe('heritajs full test suite', function() {
	var baseClassInstance;
	var subClassInstance;

	beforeEach(function () {
		baseClassInstance = new BaseClass();
		otherClassInstance = new BaseClass();
		subClassInstance = new SubClass();
	});

	describe('A BaseClass', function() {
		
		it('Should be able to get a private attribute value using a public function', function() {
			expect(baseClassInstance.getPrivateAttribute()).not.toBeFalsy();
		});
	
		it('Should be able to set a private attribute value using a public function', function() {
			var newValue = 'new private attr value';
			var oldValue = baseClassInstance.getPrivateAttribute();
			baseClassInstance.setPrivateAttribute(newValue);
			expect(baseClassInstance.getPrivateAttribute()).toBe(newValue);
			expect(otherClassInstance.getPrivateAttribute()).not.toBe(newValue);
		});
	
		it('Should not be able to directly access a private function', function() {
			expect(baseClassInstance.somePrivateFunction).toBe(undefined);
		});
	
		it('Should not be able to directly access a private attribute', function() {
			expect(baseClassInstance.somePrivateAttribute).toBe(undefined);
		});

	});

	describe('An Interface', function() {

		it('Should not be instantiated', function() {
			expect(function() {
				new BaseInterface();
			}).toThrow();
		});

	});

	describe('A SubClass', function() {

		it('Should inherit a public function from BaseClass', function() {
			expect(subClassInstance.somePublicFunction).not.toBe(undefined);
		});

		it('Should be an instance of its baseclass (using instanceof op)', function() {
			expect(subClassInstance instanceof BaseClass).toBe(true);
		});

		it('Should be an instance of its baseclass (using isInstanceOf function)', function() {
			expect(subClassInstance.isInstanceOf(BaseClass)).toBe(true);
		});

		it('Should be an instance of BaseInterface (using isInstanceOf function)', function() {
			expect(subClassInstance.isInstanceOf(BaseInterface)).toBe(true);
		});

	});

});