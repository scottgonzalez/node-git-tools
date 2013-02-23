var grunt = require( "grunt" );

grunt.loadNpmTasks( "grunt-contrib-jshint" );

grunt.initConfig({
	jshint: {
		options: {
			jshintrc: ".jshintrc"
		},
		files: [ "git-tools.js" ]
	}
});

grunt.registerTask( "default", "jshint" );
