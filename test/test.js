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
			callback );
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
