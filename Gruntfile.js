module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-watch');

	var srcFiles = [
		'Gruntfile.js',
		'index.js',
		'lib/**/*.js'
	];
	var testFiles = [
		'test/**/*.js'
	];

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			files: srcFiles,
			options: {
				curly: true,
				immed: true,
				newcap: true,
				noarg: true,
				sub: true,
				boss: true,
				eqnull: true,
				globals: {
				}
			}
		},
		mochaTest: {
			files: testFiles
		},
		watch: {
			files: [srcFiles, testFiles],
			tasks: 'check-code'
		}
	});

	// Default task(s).
	grunt.registerTask('check-code', ['jshint', 'mochaTest']);
	grunt.registerTask('default', ['check-code']);
};
