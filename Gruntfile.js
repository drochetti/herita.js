module.exports = function(grunt) {

	var basename = 'herita';

	var sources = [ 'src/Class.js', 'src/Interface.js', 'src/Aspect.js' ];

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		clean : ['build/*.*', 'doc/**/*.*'],
		jshint : {
			sources : ['src/*.js']
		},
		jasmine : {
			src : ['src/*.js', 'test/mock/*.js'],
			options : {
				specs : 'test/*.Spec.js'
			}
		},
		jsdoc : {
			api : {
				options : {
					config : 'jsdoc.json'
				},
				src : sources,
				dest : 'doc'
			}
		},
		concat : {
			dist : {
				src : sources,
				dest : 'build/herita.js'
			}
		},
		uglify : {
			dist : {
				options : {
					sourceMap : 'build/herita.js.map',
					sourceMappingURL : 'http://raw.github.com/...'
				},
				src : 'build/herita*.js',
				dest : 'build/herita.min.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('test', ['jshint', 'jasmine']);
	grunt.registerTask('default', ['clean', 'jshint', 'jasmine', 'jsdoc', 'concat', 'uglify']);

};