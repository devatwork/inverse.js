module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-gluejs2');
	grunt.loadNpmTasks('grunt-contrib-uglify');

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
		},
		gluejs: {
			browser: {
				options: {
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
					basepath: 'lib',
					export: 'inversejs'
				},
				src: '**/*.js',
				dest: 'dist/inverse.browser.js'
			},
			amd: {
				options: {
					amd: true,
					banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
					basepath: 'lib',
					export: 'inversejs'
				},
				src: '**/*.js',
				dest: 'dist/inverse.browser.amd.js'
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			browser: {
				files: {
					'dist/inverse.browser.min.js': ['dist/inverse.browser.js']
				}
			},
			amd: {
				files: {
					'dist/inverse.browser.amd.min.js': ['dist/inverse.browser.amd.js']
				}
			}
		}
	});

	// Default task(s).
	grunt.registerTask('check-code', ['jshint', 'mochaTest']);
	grunt.registerTask('default', ['check-code']);
	grunt.registerTask('dist', ['check-code', 'gluejs', 'uglify']);
};
