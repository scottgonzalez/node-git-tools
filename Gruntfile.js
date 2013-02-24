var grunt = require( "grunt" );

grunt.loadNpmTasks( "grunt-contrib-jshint" );
grunt.loadNpmTasks( "grunt-contrib-nodeunit" );

grunt.initConfig({
	jshint: {
		options: {
			jshintrc: ".jshintrc"
		},
		files: [ "git-tools.js" ]
	},
	nodeunit: {
		all: [ "test/**/*.js" ]
	}
});

grunt.registerTask( "default", [ "jshint", "nodeunit" ] );
