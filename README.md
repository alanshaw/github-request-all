# github-request-all [![Build Status](https://travis-ci.org/alanshaw/github-request-all.svg?branch=master)](https://travis-ci.org/alanshaw/github-request-all) [![Dependency Status](https://david-dm.org/alanshaw/github-request-all.svg)](https://david-dm.org/alanshaw/github-request-all)
Iterate and collect all pages of objects for a GitHub API request.

## Example

```js
var ghRequestAll = require('github-request-all')

var requestOptions = {
  url: 'https://api.github.com/users/alanshaw/repos',
  headers: {
    'User-Agent': 'Your application UA' // Required by github
  }
}

ghRequestAll(requestOptions, function (err, results) {
  if (err) throw err
  console.log(results) // All repos for alanshaw
})
```

## `ghRequestAll(requestOptions, cb)`
Request all pages of the paginated github request. `requestOptions` are options passed to [`request`](https://www.npmjs.com/package/request) and should, at minimum include the URL to request. `cb` receives the results array.

## `ghRequestAll(requestOptions, opts, cb)`
As above, but the second parameter `opts` are options for github-request-all:

### `opts.userAgent`
Set the "User-Agent" header (default 'github-request-all').

### `opts.perPage`
Set the number of items requested in a page (default 100).
