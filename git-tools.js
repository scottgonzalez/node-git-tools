var spawn = require( "child_process" ).spawn;

function extend( a, b ) {
	for ( var prop in b ) {
		a[ prop ] = b[ prop ];
	}

	return a;
}

function Repo( path ) {
	this.path = path;
}

Repo.parsePerson = (function() {
	var rPerson = /^(\S+)\s(.+)$/;
	return function( person ) {
		var matches = rPerson.exec( person );
		return {
			email: matches[ 1 ],
			name: matches[ 2 ]
		};
	};
})();

Repo.prototype.exec = function() {
	var args = [].slice.call( arguments );
	var callback = args.pop();
	var stdout = "";
	var stderr = "";
	var child = spawn( "git", args, { cwd: this.path } );
	child.stdout.on( "data", function( data ) {
		stdout += data;
	});
	child.stderr.on( "data", function( data ) {
		stderr += data;
	});
	child.on( "close", function( code ) {
		var error;
		if ( code ) {
			error = new Error( stderr );
			error.code = code;
			return callback( error );
		}

		callback( null, stdout.trimRight() );
	});
};

Repo.prototype.activeDays = function( committish, callback ) {
	if ( !callback ) {
		callback = committish;
		committish = "master";
	}

	this.exec( "log", "--format=%at", committish, function( error, dates ) {
		if ( error ) {
			return callback( error );
		}

		var dateMap = {
			activeDays: 0,
			commits: 0,
			dates: {},
			years: {}
		};

		dates.split( "\n" ).sort().forEach(function( timestamp ) {
			var date = new Date( timestamp * 1000 );
			var year = date.getFullYear();
			var month = date.getMonth() + 1;
			var day = date.getDate();

			date = year + "-" +
				(month < 10 ? "0" : "") + month + "-" +
				(day < 10 ? "0" : "") + day;

			if ( !dateMap.dates[ date ] ) {
				dateMap.dates[ date ] = 0;
			}
			dateMap.commits++;
			dateMap.dates[ date ]++;

			if ( !dateMap.years[ year ] ) {
				dateMap.years[ year ] = {
					activeDays: 0,
					commits: 0,
					months: {}
				};
			}
			dateMap.years[ year ].commits++;

			if ( !dateMap.years[ year ].months[ month ] ) {
				dateMap.years[ year ].months[ month ] = {
					activeDays: 0,
					commits: 0,
					days: {}
				};
			}
			dateMap.years[ year ].months[ month ].commits++;

			if ( !dateMap.years[ year ].months[ month ].days[ day ] ) {
				dateMap.years[ year ].months[ month ].days[ day ] = {
					commits: 0
				};
				dateMap.activeDays++;
				dateMap.years[ year ].activeDays++;
				dateMap.years[ year ].months[ month ].activeDays++;
			}
			dateMap.years[ year ].months[ month ].days[ day ].commits++;
		});

		callback( null, dateMap );
	});
};

Repo.prototype.age = function( callback ) {
	this.exec( "log", "--reverse", "--format=%cr", function( error, stdout ) {
		if ( error ) {
			return callback( error );
		}

		callback( null, stdout.split( "\n" )[ 0 ].replace( /\sago/, "" ) );
	});
};

Repo.prototype.authors = function( committish, callback ) {
	if ( !callback ) {
		callback = committish;
		committish = "master";
	}

	this.exec( "log", "--format=%aE %aN", committish, function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var authors = data.split( "\n" );
		var authorMap = {};
		var totalCommits = 0;

		authors.forEach(function( author ) {
			if ( !authorMap[ author ] ) {
				authorMap[ author ] = 0;
			}

			authorMap[ author ]++;
			totalCommits++;
		});

		authors = Object.keys( authorMap ).map(function( author ) {
			var commits = authorMap[ author ];
			return extend( Repo.parsePerson( author ), {
				commits: commits,
				commitsPercent: (commits * 100 / totalCommits).toFixed( 1 )
			});
		}).sort(function( a, b ) {
			return b.commits - a.commits;
		});

		callback( null, authors );
	});
};

Repo.prototype.branches = function( callback ) {
	this.exec( "for-each-ref",
		"--format=" +
			"%(refname:short)%0a" +
			"%(authordate:rfc2822)%0a" +
			"%(authoremail) %(authorname)%0a" +
			"%(subject)%0a" +
			"%(objectname)%0a",
		"refs/heads",
	function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var branches = data.split( "\n\n" ).map(function( branch ) {
			var lines = branch.split( "\n" );
			var name = lines[ 0 ];
			var date = new Date( lines[ 1 ] );
			var author = Repo.parsePerson( lines[ 2 ] );
			var subject = lines[ 3 ];
			var sha = lines[ 4 ];

			return {
				name: name,
				sha: sha,
				date: date,
				subject: subject,
				author: author
			};
		}).sort(function( a, b ) {
			return b.date - a.date;
		});

		callback( null, branches );
	});
};

Repo.prototype.currentBranch = function( callback ) {
	this.exec( "rev-parse", "--abbrev-ref", "HEAD", function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var branch = data === "HEAD" ? null : data;
		callback( null, branch );
	});
};

Repo.prototype.isRepo = function( callback ) {
	this.exec( "rev-parse", "--git-dir", function( error ) {
		if ( error ) {
			if ( error.message.indexOf( "Not a git repository" ) ) {
				return callback( null, false );
			}

			return callback( error );
		}

		callback( null, true );
	});
};

Repo.prototype.remotes = function( callback ) {
	this.exec( "remote", "-v", function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var remotes = data.split( "\n" );
		var rRemote = /^(\S+)\s(\S+)/;
		var remoteMap = {};

		remotes.forEach(function( remote ) {
			var matches = rRemote.exec( remote );

			// New repositories with no remotes will have `origin` but no URL
			if ( !matches ) {
				return;
			}

			var name = matches[ 1 ];
			var url = matches[ 2 ];

			remoteMap[ name ] = url;
		});

		remotes = Object.keys( remoteMap ).map(function( remote ) {
			return {
				name: remote,
				url: remoteMap[ remote ]
			};
		});

		callback( null, remotes );
	});
};

Repo.prototype.tags = function( callback ) {
	this.exec( "for-each-ref",
		"--format=" +
			"%(refname:short)%0a" +
			"%(authordate)%(taggerdate)%0a" +
			"%(objectname)%0a",
		"refs/tags",
	function( error, data ) {
		if ( error ) {
			return callback( error );
		}

		var tags = data.split( "\n\n" ).map(function( tag ) {
			var lines = tag.split( "\n" );
			var name = lines[ 0 ];
			var date = new Date( lines[ 1 ] );
			var sha = lines[ 2 ];

			return {
				name: name,
				sha: sha,
				date: date
			};
		}).sort(function( a, b ) {
			return b.date - a.date;
		});

		callback( null, tags );
	});
};

module.exports = Repo;
