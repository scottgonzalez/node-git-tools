var grunt = require( "grunt" );

grunt.loadNpmTasks( "grunt-contrib-jshint" );
grunt.loadNpmTasks( "grunt-contrib-nodeunit" );

grunt.initConfig({
	jshint: {
		src: {
			options: {
				jshintrc: ".jshintrc"
			},
			src: [ "git-tools.js" ]
		},
		test: {
			options: {
				jshintrc: ".jshintrc"
			},
			src: [ "test/**.js" ]
		}
	},
	nodeunit: {
		all: [ "test/**/*.js" ]
	}
});

grunt.registerTask( "default", [ "jshint", "nodeunit" ] );
