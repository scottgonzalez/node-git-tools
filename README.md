# node-git-tools

Tools for parsing data out of git repositories.

## About

The goal of node-git-tools is to provide a set of tools that can be used to
easily write custom git commands or other scripts that are tightly integrated
with git.

I expect the API to grow over time and will happily entertain any feature
requests. If there is anything you'd like added, just file an issue.

## Installation

```sh
npm install git-tools
```

## Usage

```js
var Repo = require( "git-tools" );
var repo = new Repo( "path/to/repo" );
repo.authors(function( error, authors ) {
	console.log( authors );
});
```



## API

### activeDays( [committish], callback )

Gets the number of active days (unique days of authorship). Includes activity
by day, month, year, and the entire history.

* `committish` (String; default: `"master"`): Committish range to analyze.
* `callback` (Function; `function( error, activeDays )`): Function to invoke after getting active days.
  * `activeDays` (Object): Summary of active days.

The `activeDays` object has the following form:

```js
{
	activeDays: Number,
	commits: Number,
	dates: {
		"YYYY-MM-DD": Number( commits ),
		...
	},
	years: {
		"YYYY": {
			activeDays: Number,
			commits: Number,
			months: {
				"M": {
					activeDays: Number,
					commits: Number,
					days: {
						"D": {
							commits: Number
						},
						...
					}
				},
				...
			}
		},
		...
	}
}
```



### age( callback )

Gets the age of the repository.

* `callback` (Function; `function( error, age )`): Function to invoke after getting the age.
  * `age` (String): The age of the repository.



### authors( [committish], callback )

Gets all authors, sorted by number of commits.

* `committish` (String; default: `"master"`): Committish range to analyze.
* `callback` (Function; `function( error, authors )`): Function to invoke after getting authors.
  * `authors` (Array): All authors, sorted by number of commits.

Each author object contains the following properties:

* `email` (String): Author's email address.
* `name` (String): Author's name.
* `commits` (Number): Number of commits.
* `commitsPercent` (Number): Percentage of commits.



### branches( callback )

Gets all branches in order of most recent commit.

* `callback` (Function; `function( error, branches )`): Function to invoke after getting branches.
  * `branches` (Array): All branches, sorted by most recent commit date.

Each branch object contains the following properties:

* `name` (String): Branch name.
* `date` (Date): Author date of most recent commit.
* `subect` (String): Subject (first line) of most recent commit.
* `author` (Object): Author of most recent commit.
  * `email` (String): Author's email address.
  * `name` (String): Author's name.



### currentBranch( callback )

Gets the name of the currently checked out branch, if any.

* `callback` (Function; `function( error, branch )`): Function to invoke after getting the branch.
  * `branch` (String|null): Branch name, or `null` if in detached HEAD state.



### tags( callback )

Gets all tags in reverse chronological order.

Lightweight tags are sorted by author date and annotated tags are sorted by tagger date.

* `callback` (Function; `function( error, tags )`): Function to invoke after getting tags.
  * `tags` (Array): All tags, sorted by date.

Each tag object contains the following properties:

* `name` (String): Tag name.
* `date` (Date): Author date for ligthweight tags, tagger date for annotated tags.



## License

Copyright 2013 Scott González. Released under the terms of the MIT license.
