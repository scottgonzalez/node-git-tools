var fs = require( "fs" );
var rimraf = require( "rimraf" );
var path = __dirname + "/repo";
var Repo = require( "../git-tools" );
var testRepo = new Repo( path );

function createRepo( callback ) {
	rimraf.sync( path );
	fs.mkdirSync( path );
	testRepo.exec( "init", function( error ) {
		if ( error ) {
			throw error;
		}

		testRepo.exec( "commit", "--allow-empty",
			"--author=John Doe <john.doe@example.com>", "-m first commit",
			function( error ) {
				if ( error ) {
					throw error;
				}

				testRepo.exec( "tag", "-a", "v0.1", "-m", "tag", callback );
			});
	});
}

exports.authors = {
	"one commit": function( test ) {
		createRepo(function( error ) {
			if ( error ) {
				throw error;
			}

			testRepo.authors(function( error, authors ) {
				test.ifError( error );

				test.deepEqual( authors, [
					{
						email: "john.doe@example.com",
						name: "John Doe",
						commits: 1,
						commitsPercent: 100
					}
				], "one author" );
				test.done();
			});
		});
	}
};

exports.describe = {
	"default description": function( test ) {
		createRepo(function( error ) {
			if ( error ) {
				throw error;
			}

			testRepo.describe(function( error, description ) {
				test.ifError( error );

				test.equal( description, "v0.1", "a tag");
				test.done();
			});
		});
	},
	"long description": function( test ) {
		createRepo(function( error ) {
			if ( error ) {
				throw error;
			}

			testRepo.describe( {
					long: true
				}, 
		        function( error, description ) {
					test.ifError( error );

					test.ok( /v0\.1-0-g.{7}/.test( description ), "a long tag");
					test.done();
			});
		});
	}
};
